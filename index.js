'use strict';

// import libraries
var http = require('http');
var logger = require('./logger.js');

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
