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
    fs.readFile(__dirname + '/public/index.html', function (err, data) {

        // log the possible error
        if (err) {
            logger.emit('error', 'error reading index.html -> ' + err);
            response.writeHead(404);
        }

        // return the file content
        else {
            response.writeHead(200);
            response.write(data);
        }

        // end the response
        response.end();
    });

});

// run webserver
var port = process.env.PORT || 8080;
server.listen(port, function () {
    console.log('listen to port ' + port);
});
