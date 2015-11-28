'use strict';

// import libraries
var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var logger = require('./logger.js');
var socket = require('socket.io');
var users = require('./users.js');
var history = require('./history.js');

// keys and certificates locations
var options = {
    key: fs.readFileSync(__dirname + '/cert/server.key'),
    cert: fs.readFileSync(__dirname + '/cert/server.crt'),
    ca: fs.readFileSync(__dirname + '/cert/ca.crt')
};


// create an express app to serve the static files in the 'public' folder
var app = express();
app.use(express.static('public'));


// create http and https server
var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);


// create socket.io instance: use both servers
var io = socket()
    .listen(httpServer)
    .listen(httpsServer);

// handle socket.io connections
io.on('connect', function (socket) {
    logger.emit('info', 'client connected');

    // login attemp
    socket.on('login', function (username) {

        // check if the username is available
        if (!socket.username && users.insertUser(username)) {

            // log
            logger.emit('info', 'new login ok: ' + username);

            // save the username for this socket
            socket.username = username;

            // login ok
            socket.emit('login_ok', username);

            // send connected users
            socket.emit('users', users.getUsers());

            // send chat history
            history.getMessages().forEach(function(message) {
                socket.emit('message', message);
            });

            // notify the other clients
            socket.broadcast.emit('user_join', username);
        }

        // username taken
        else {

            // log
            logger.emit('error', 'new login fail: ' + username);

            // login fail
            socket.emit('login_fail', 'username already taken');
        }
    });

    // listen to messages
    socket.on('message', function (message) {
        logger.emit('info', 'new message: ' + message);

        // make sure the user is logged in the chat
        if (socket.username) {

            // add the username to the message
            var msg = {
                message: message,
                username: socket.username
            };

            // send it to all the other clients
            socket.broadcast.emit('message', msg);

            // send it back to this client
            socket.emit('message', msg);

            // store message
            history.storeMessage(msg);
        }
    });

    // the client disconnects
    socket.on('disconnect', function () {

        // remove username from the lists
        // [make sure the user was logged in]
        if (users.removeUser(socket.username)) {

            // log
            logger.emit('info', 'user left: ' + socket.username);

            // say everybody that the user left
            socket.broadcast.emit('user_left', socket.username);
        }

        // log
        logger.emit('info', 'client disconnected');
    });

    // the user is typing
    socket.on('start_typing', function () {
        logger.emit('info', 'start_typing: ' + socket.username);

        // make sure the user is logged in the chat
        if (socket.username) {

            // say everybody that the user is typing
            socket.broadcast.emit('start_typing', socket.username);
        }
    });

    // the user stopped typing
    socket.on('stop_typing', function () {
        logger.emit('info', 'stop_typing: ' + socket.username);

        // make sure the user is logged in the chat
        if (socket.username) {

            // say everybody that the user has stopped typing
            socket.broadcast.emit('stop_typing', socket.username);
        }
    });

});


// run http server
var httpPort = process.env.PORT || 8080;
httpServer.listen(httpPort, function () {
    console.log('HTTP server listening at port %d', httpPort);
});

// run https server
var httpsPort = process.env.PORT_HTTPS || 8443;
httpsServer.listen(httpsPort, function () {
    console.log('HTTPS server listening at port %d\n', httpsPort);
});
