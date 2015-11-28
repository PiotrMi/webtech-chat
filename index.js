'use strict';

// import libraries
var http = require('http');
var EventEmitter = require('events');

// colours constansts
const COLOR_RED = '\x1b[31;1m';
const COLOR_BLUE = '\x1b[36;1m';
const COLOR_RESET = '\x1b[0m';


// create custom logger
var logger = new EventEmitter();
logger.on('info', function (message) {
    console.log(COLOR_BLUE, message, COLOR_RESET);
});
logger.on('error', function (message) {
    console.log(COLOR_RED, message, COLOR_RESET);
});


// create simple webserver
var server = http.createServer(function (request, response) {

    // log request
    logger.emit('info', '>> new request: ' + request.url);

    // send respose
    response.writeHead(418);
    response.write('I\'m a teapot\n');
    response.end();
});

// run webserver
var port = process.env.PORT || 8080;
server.listen(port, function () {
    console.log('listen to port ' + port);
});
