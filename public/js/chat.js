$(function () {
    'use strict';

    /////////////////////////////////////////////////////////////////////
    // Appearance, DOM elements
    /////////////////////////////////////////////////////////////////////

    // chat appearance
    var FADE_TIME = 150; // ms

    // better colors
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00', '#58dc00', '#287b00',
        '#a8f07a', '#4ae8c4', '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // login page references
    var $loginPage = $('.login.page');
    var $loginUsername = $loginPage.find('.login-username');

    // chat page references
    var $chatPage = $('.chat.page');
    var $chatElements = $chatPage.find('.chat-messages');
    var $chatInput = $chatPage.find('.chat-input');

    // current input (depending on selected page)
    var $currentInput = $loginUsername.focus();


    /////////////////////////////////////////////////////////////////////
    // Socket.IO section
    /////////////////////////////////////////////////////////////////////

    // current status
    var status = {
        loggedIn: false
    };

    // create socket.io instance
    var socket = io();

    // login was ok
    socket.on('login_ok', function (data) {
        status.loggedIn = true;

        // switch to chat page
        showChat();
    });

    /////////////////////////////////////////////////////////////////////
    // Input events
    /////////////////////////////////////////////////////////////////////

    // key pressed
    $(window).keydown(function (event) {

        // auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }

        // ENTER pressed
        if (event.which === 13) {

            // if on chat page -> send message
            if (status.loggedIn) {

                // send message
                sendMessage();
            }

            // if on login page -> try to join the chat
            else {
                var username = escapeHtml($loginUsername.val().trim());

                // try to join the chat
                if (username) {
                    socket.emit('login', username);
                }
            }
        }
    });

    // focus input when clicking anywhere on login page
    $loginPage.click(function () {
        $currentInput.focus();
    });

    // focus input when clicking on the message input's border
    $chatInput.click(function () {
        $chatInput.focus();
    });


    /////////////////////////////////////////////////////////////////////
    // Functions
    /////////////////////////////////////////////////////////////////////

    // show chat page
    function showChat() {

        // hide login
        $loginPage.fadeOut();

        // show chat
        $chatPage.show();

        // focus on message input
        $currentInput = $chatInput.focus();
    }

    // prevents input from having injected markup
    function escapeHtml(string) {
        return $('<div/>').text(string).text();
    }

    // gets the color of a username through a hash
    function getUsernameColor(username) {

        // compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }

        // calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

    // sends a chat message
    function sendMessage() {

        // get + escape text
        var message = escapeHtml($chatInput.val());

        // if non-empty message and socket connected
        if (message && status.loggedIn) {

            // TODO: send message to the server

            // cancel the text
            $chatInput.val('');
        }
    }

    // adds a message element to the messages and scrolls to the bottom
    // end = false --> append it after the last chat message (not typing message)
    // end = true --> append it after the last typing message
    function addChatElement($el, end) {

        // fade in the new element
        $el.hide().fadeIn(FADE_TIME);

        // append the element
        if (end === true) {
            $chatElements.append($el);
        } else {
            var $chatMessages = $chatElements.find('.message:not(.typing), .log').last();
            if ($chatMessages.length > 0) {
                $chatMessages.after($el);
            } else {
                $chatElements.append($el);
            }
        }

        // scroll to bottom
        $chatElements[0].scrollTop = $chatElements[0].scrollHeight;
    }

    // create a new chat message element
    function createChatElement(message) {

        // username
        var $usernameSpan = $('<span class="username"/>')
            .text(message.username)
            .css('color', getUsernameColor(message.username));

        // message body
        var $messageBodySpan = $('<span class="message-body">')
            .text(message.message);

        // message
        return $('<li class="message"/>')
            .data('username', message.username)
            .append($usernameSpan, $messageBodySpan);
    }

    // adds the visual chat message to the message list
    function addChatMessage(message) {

        // append it to the chat
        addChatElement(createChatElement(message), false);
    }
});
