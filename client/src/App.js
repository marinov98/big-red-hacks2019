import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import { Alert, Spinner } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zipcode: 0,
      data: {},
      fireData: [],
      searchLat: 0,
      searchLon: 0
    };
  }

  getZip = async zip => {
    try {
      this.setState({ data: { waiting: true } });

      // Forcast data
      const { data } = await axios({
        method: 'get',
        url: `/ibmCloud/forcast/${zip}`
      });

      this.setState({
        zipcode: zip,
        data: data,
        searchLat: data.metadata.latitude,
        searchLon: data.metadata.longitude
      });

      // Fire data
      const fireResponse = await axios({
        method: 'get',
        url: `/ibmCloud/firedata/${zip}`
      });
      this.setState({ fireData: fireResponse.data });
    } catch (err) {
      this.setState({ data: { error: true } });
      console.log(err);
    }
  };

  displayData = () => {
    if (this.state.data.metadata) {
      return (
        <div className="forcast-text-box">
          <h5>Forcast for zipcode: {this.state.zipcode}</h5>
          <p>Wind Speed: {this.state.data.observation.wspd}</p>
          <p>Precipitation: {this.state.data.observation.precip_total}</p>
          <p>Wind Direction: {this.state.data.observation.wdir}</p>
        </div>
      );
    } else if (this.state.data.waiting) {
      return (
        <div>
          <Spinner
            type="grow"
            style={{ marginTop: '30px', width: '10rem', height: '10rem' }}
            color="danger"
          ></Spinner>
        </div>
      );
    } else if (this.state.data.error) {
      return <div>Zip code could not be found</div>;
    } else {
      return <div>No data to currently display</div>;
    }
  };

  analyzeFireData = () => {
    const warnArr = [];

    if (this.state.fireData.length !== 0 && this.state.data.observation) {
      for (const coordinate of this.state.fireData) {
        if (
          coordinate.lat - this.state.searchLat > 0 &&
          coordinate.lon - this.state.searchLon > 0
        ) {
          if (this.state.data.observation.wdir >= 0 && this.state.data.observation.wdir <= 90) {
            warnArr.push(coordinate);
          }
        } else if (
          coordinate.lat - this.state.searchLat < 0 &&
          coordinate.lon - this.state.searchLon > 0
        ) {
          if (this.state.data.observation.wdir >= 90 && this.state.data.observation.wdir <= 180) {
            warnArr.push(coordinate);
          }
        } else if (
          coordinate.lat - this.state.searchLat < 0 &&
          coordinate.lon - this.state.searchLon < 0
        ) {
          if (this.state.data.observation.wdir >= 180 && this.state.data.observation.wdir <= 270) {
            warnArr.push(coordinate);
          }
        } else if (
          coordinate.lat - this.state.searchLat > 0 &&
          coordinate.lon - this.state.searchLon < 0
        ) {
          if (this.state.data.observation.wdir >= 270 && this.state.data.observation.wdir <= 360) {
            warnArr.push(coordinate);
          }
        }
      }

      return warnArr;
    }
  };

  displayWarnings = () => {
    const warnings = this.analyzeFireData();
    if (warnings && warnings.length > 0) {
      return (
        <div>
          <Alert color="danger">WARNING! Fire spotted within 10 miles be aware</Alert>
        </div>
      );
    } else {
      return <div>No safety hazards found</div>;
    }
  };

  render() {
    return (
      <div className="App">
        <img src={require('./guardian.svg')} alt="guardian logo"></img>
        <h1>Welcome To Weather Guardian!</h1>
        <SearchBar getZip={this.getZip}></SearchBar>
        {this.displayData()}
        {this.displayWarnings()}
      </div>
    );
  }
}

App.propTypes = {
  zipcode: PropTypes.number,
  data: PropTypes.object,
  fireData: PropTypes.array
};
