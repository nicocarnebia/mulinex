var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Game = require('./Game.js');
var UTILS = require('./Utils/Utils.js');
var game = new Game();

server.listen(5555,function (err) {
    game.init();
    setEventHandlers();
});

var setEventHandlers = function () {
    // Socket.IO
    io.sockets.on('connection', onSocketConnection);
};

// New socket connection
function onSocketConnection (client) {
    console.log('New player has connected: ' + client.id);
    client.on('disconnect', onClientDisconnect);
    client.on('new player', onNewPlayer);
    client.on('move player', onMovePlayer);
    client.on('collision',onPlayersColission);
}

// on colission collided
function onPlayersColission (data) {
    game.handlePlayersColission(this,io,data);//chequear is io se necesita
}

// Socket client has disconnected
function onClientDisconnect () {
    game.handlePlayerDiscconnect(this,io);//chequear is io se necesita
}

// New player has joined
function onNewPlayer (data) {
    game.handleNewPlayer(this,data);
}

// Player has moved
function onMovePlayer (data) {
    game.handlePlayerMove(this,data);

}


