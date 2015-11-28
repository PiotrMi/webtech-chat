'use strict';

// import libraries
var http = require('http');
var fs = require('fs');
var url = require('url');
var logger = require('./logger.js');
var socket = require('socket.io');

// create simple webserver: now serve the index.html
var server = http.createServer(function (request, response) {

    // log request
    logger.emit('info', '>> new request: ' + request.url);

    // parse the request
    var path = url.parse(request.url).pathname;
    if (path === '/') {
        path = '/index.html';
    }

    // read the file
    var fileStream = fs.createReadStream(__dirname + '/public' + path);

    // serve file asynchronusly
    response.writeHead(200);
    fileStream.pipe(response);

    // file not found
    fileStream.on('error', function (err) {
        response.writeHead(404);
        response.end();
    });

});

// create socket.io instance and tell it to use our server
var io = socket(server);
io.on('connect', function (socket) {
    logger.emit('info', 'client connected');

    // login attemp
    socket.on('login', function(username) {
        logger.emit('info', 'new login: ' + username);

        // save the username for this socket
        socket.username = username;

        // login ok
        socket.emit('login_ok');
    });
});


// run webserver
var port = process.env.PORT || 8080;
server.listen(port, function () {
    console.log('listen to port ' + port);
});
