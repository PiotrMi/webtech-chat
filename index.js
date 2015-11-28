'use strict';

// import libraries
var http = require('http');
var fs = require('fs');
var logger = require('./logger.js');

// create simple webserver: now serve the index.html
var server = http.createServer(function (request, response) {

    // log request
    logger.emit('info', '>> new request: ' + request.url);

    // read the file
    var fileStream = fs.createReadStream(__dirname + '/public/index.html');

    // serve file asynchronusly
    response.writeHead(200);
    fileStream.pipe(response);
});

// run webserver
var port = process.env.PORT || 8080;
server.listen(port, function () {
    console.log('listen to port ' + port);
});
