const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const http = require('http');
const appConfig = require('./config/appConfig');
const logger = require('./app/libs/loggerLib');
const routeLoggerMiddleware = require('./app/middlewares/routeLogger.js');
const globalErrorMiddleware = require('./app/middlewares/appErrorHandler');
const mongoose = require('mongoose');
const morgan = require('morgan');
const socketLib =require("./app/libs/socketLib");

app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(routeLoggerMiddleware.logIp);
app.use(globalErrorMiddleware.globalErrorHandler);




const modelsPath = './app/models';
const controllersPath = './app/controllers';
const libsPath = './app/libs';
const middlewaresPath = './app/middlewares';
const routesPath = './app/routes';

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*" ,'http://localhost:3000');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

//Bootstrap models
fs.readdirSync(modelsPath).forEach(function (file) {
  if (~file.indexOf('.js')) require(modelsPath + '/' + file)
});
// end Bootstrap models

// Bootstrap route
fs.readdirSync(routesPath).forEach(function (file) {
  if (~file.indexOf('.js')) {
    let route = require(routesPath + '/' + file);
    route.setRouter(app);
  }
});
// end bootstrap route
var route, routes = [];


// calling global 404 handler after route
app.use(globalErrorMiddleware.globalNotFoundHandler);

// end global 404 handler
/**
 * Create HTTP server.
 */
const server = http.createServer(app);
// start listening to http server
server.listen(appConfig.port);
server.on('error', onError);
server.on('listening', onListening);

// end server listening code

//socket io connection handler
socketLib.setServer(server);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    logger.error(error.code + ' not equal listen', 'serverOnErrorHandler', 10)
    throw error;
  }
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(error.code + ':elavated privileges required', 'serverOnErrorHandler', 10);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(error.code + ':port is already in use.', 'serverOnErrorHandler', 10);
      process.exit(1);
      break;
    default:
      logger.error(error.code + ':some unknown error occured', 'serverOnErrorHandler', 10);
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  ('Listening on ' + bind);
  logger.info('server listening on port ' + addr.port, 'serverOnListeningHandler', 10);
  mongoose.set('useCreateIndex', true);
  mongoose.connect(appConfig.db.uri,{ useNewUrlParser: true });
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

/**
 * database connection settings
 */
mongoose.connection.on('error', function (err) {
  logger.error(err,'mongoose connection on error handler', 10)
  //process.exit(1)
}); // end mongoose connection error

mongoose.connection.on('open', function (err) {
  if (err) {
    logger.error(err, 'mongoose connection open handler', 10)
  } else {
    logger.info("database connection open",'database connection open handler', 10)
  }
  //process.exit(1)
}); 
// enr mongoose connection open handler


module.exports = app;