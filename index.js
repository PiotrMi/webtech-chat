'use strict';

// import libraries
var http = require('http');
var fs = require('fs');
var url = require('url');
var logger = require('./logger.js');

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

// run webserver
var port = process.env.PORT || 8080;
server.listen(port, function () {
    console.log('listen to port ' + port);
});
