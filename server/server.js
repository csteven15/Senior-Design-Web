// This is required for Amazon Cognito to work, since it expects a fetch method
global.fetch = require('node-fetch');

// General dependencies
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const schedule = require('node-schedule');

// Custom dependencies
const debugPrint = require('./development/DebugPrint');
const keys = require('./config/keys');
const apiRouter = require('./routes/api/ApiRouter');

const app = express();

// Need this so it can display the front end
app.use('/', express.static(path.resolve(__dirname, '../client/build')));
app.use('/permits', express.static(path.resolve(__dirname, '../client/build')));
app.use('/permits/:id', express.static(path.resolve(__dirname, '../client/build')));
app.use('/guest', express.static(path.resolve(__dirname, '../client/build')));
app.use('/student', express.static(path.resolve(__dirname, '../client/build')));
app.use('/maps', express.static(path.resolve(__dirname, '../client/build')));
app.use('/contact', express.static(path.resolve(__dirname, '../client/build')));
app.use('/users/search', express.static(path.resolve(__dirname, '../client/build')));
app.use('/users/create', express.static(path.resolve(__dirname, '../client/build')));
app.use('/users/update', express.static(path.resolve(__dirname, '../client/build')));
app.use('/users/heatmap', express.static(path.resolve(__dirname, '../client/build')));
app.use('/users/global', express.static(path.resolve(__dirname, '../client/build')));
app.use('/vehicles', express.static(path.resolve(__dirname, '../client/build')));
app.use('/dashboard', express.static(path.resolve(__dirname, '../client/build')));
app.use('/information', express.static(path.resolve(__dirname, '../client/build')));
app.use('/authenticated/page-1', express.static(path.resolve(__dirname, '../client/build')));
app.use('/authenticated/page-2', express.static(path.resolve(__dirname, '../client/build')));
app.use('/authenticated/page-3', express.static(path.resolve(__dirname, '../client/build')));
app.use('/authenticated/page-4', express.static(path.resolve(__dirname, '../client/build')));
app.use('/authenticated/page-5', express.static(path.resolve(__dirname, '../client/build')));
app.use('/unauthenticated/page-1', express.static(path.resolve(__dirname, '../client/build')));
app.use('/unauthenticated/page-2', express.static(path.resolve(__dirname, '../client/build')));
app.use('/unauthenticated/page-3', express.static(path.resolve(__dirname, '../client/build')));
app.use('/unauthenticated/page-4', express.static(path.resolve(__dirname, '../client/build')));
app.use('/unauthenticated/page-5', express.static(path.resolve(__dirname, '../client/build')));

// Linking api path to appropriate router
app.use('/api', apiRouter);

// Connect to the database and then start listening!
function startServer(port) {
  // Make sure the user knows what mode the server is in!
  if (keys.mode === 'prod') {
    debugPrint('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    debugPrint('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    debugPrint('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    debugPrint('!!!!!!!!SERVER STARTING IN PRODUCTION MODE!!!!!!!!');
    debugPrint('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    debugPrint('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    debugPrint('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  } else if (keys.mode === 'test') {
    debugPrint('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    debugPrint('~~~~~~~~STARTING SERVER IN TEST MODE~~~~~~~~');
    debugPrint('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  } else {
    debugPrint('Invalid server mode in keys.js! Refusing to start server!');
    return;
  }
  if (port === undefined || port === null) {
    throw 'You must specify what port to use for startServer!';
  }

  app.listen(port, () => {
    debugPrint(`Server listening on port ${port}.`);
  });

  debugPrint(`Connecting to MongoDB using ${keys.mongoURI}`);
  mongoose
    .connect(keys.mongoURI)
    .then(() => {
      debugPrint('Successfully connected to MongoDB.');

      // TODO: remove before production
      require('./development/AdminInitialization')();
    })
    .catch(error => {
      debugPrint(`Failed to connect: ${error}`);
    });
}

schedule.scheduleJob({ hour: 05, minute: 10 }, require('./helpers/PermitExpirationTool'));
startServer(8080);
