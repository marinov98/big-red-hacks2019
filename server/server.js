const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const { ibmController, googleController } = require('./routes');

// Initialize express
const app = express();

// Set port
const port = parseInt(process.env.PORT, 10) || 8080;

app.set('port', port);

// Utilize Morgan logger
app.use(logger('dev'));

// Use bodyParser middleware to parse requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

if (process.env.NODE_ENV !== 'production') {
  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.get('/', (req, res, next) => {
    res.send('Server up and listening for warnings!');
  });
}

/**
 *  ROUTES
 */
app.use('/ibmCloud', ibmController);
app.use('/googleCloud', googleController);

// For deployment ONLY
// send the static build folder created by the react app through the server
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Have the app listen
app.listen(port, () => console.log(`Server up! Listening on  http://localhost:${port}`));
