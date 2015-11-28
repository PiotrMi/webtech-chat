'use strict';

// load http module
var http = require('http');

// create simple webserver
var server = http.createServer(function (request, response) {
    response.writeHead(418);
    response.write('I\'m a teapot\n');
    response.end();
});

// run webserver
var port = process.env.PORT || 8080;
server.listen(port, function () {
    console.log('listen to port ' + port);
});
