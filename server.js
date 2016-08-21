var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var players;
server.listen(5555,function (err) {
    init();
});
function init () {
    // Create an empty array to store players
    players = [];

    // Start listening for events
    setEventHandlers();
};
var setEventHandlers = function () {
    // Socket.IO
    io.sockets.on('connection', onSocketConnection);
};

// New socket connection
function onSocketConnection (client) {

    console.log('New player has connected: ' + client.id);
    // Listen for client disconnected
    client.on('disconnect', onClientDisconnect);
    // Listen for new player message
    client.on('new player', onNewPlayer);
    // Listen for move player message
    client.on('move player', onMovePlayer);

    client.on('collision', function (data) {
        console.log("COLISION");
        this.broadcast.emit('collision', {"x":data.x,"y":data.y})
        //compare speed
        var playerA = playerById(data.player_a_id);
        var playerB = playerById(data.player_b_id);
        if(!playerA || !playerB)return;//nothing to do...
        if(playerA.getSpeed()>playerB.getSpeed()){
            io.sockets.emit('remove player', {id: playerB.id});
        }else if(playerA.getSpeed()<playerB.getSpeed()){
            io.sockets.emit('remove player', {id: playerA.id});
        }//if equal do nothing
    });
}
// Socket client has disconnected
function onClientDisconnect () {
    console.log('Player has disconnected: ' + this.id);
    var removePlayer = playerById(this.id);
    // Player not found
    if (!removePlayer) {
        console.log('Player not found on disconnect: ' + this.id);
        console.log(players);
        return;
    }
    // Remove player from players array
    players.splice(players.indexOf(removePlayer), 1);
    // Broadcast removed player to ALL EXCEPT socket connected socket clients

    //this.broadcast.emit('remove player', {id: this.id});
    // Broadcast removed player to ALL connected socket clients
    io.sockets.emit('remove player', {id: this.id});
}

// New player has joined
function onNewPlayer (data) {
    console.log("NEW PLAYER SERVER");
    // Create a new player
    var newPlayer = new Player(data.x, data.y);
    newPlayer.id = this.id;
    // Broadcast new player to connected socket clients
    //io.sockets.emit('new player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});
    this.broadcast.emit('new player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});
    // Send existing players to the new player
    var i, existingPlayer;
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i];
        this.emit('new player', {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
    }
    // Add new player to the players array
    players.push(newPlayer)
}

// Player has moved
function onMovePlayer (data) {
    // Find player in array
    var movePlayer = playerById(this.id)

    // Player not found
    if (!movePlayer) {
        //console.log('Player not found: ' + this.id)
        return
    }
    // Update player position
    movePlayer.setX(data.x);
    movePlayer.setY(data.y);
    movePlayer.setRotation(data.rotation);
    movePlayer.setSpeed(data.speed);

    // Broadcast updated position to connected socket clients
    this.broadcast.emit('move player', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), rotation:movePlayer.getRotation()})
}

/* ************************************************
 ** GAME HELPER FUNCTIONS
 ************************************************ */
// Find player by ID
function playerById (id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id === id) {
            return players[i];
        }
    }
    return false;
};

/* ************************************************
 ** GAME PLAYER CLASS
 ************************************************ */
var Player = function (startX, startY) {
    var x = startX;
    var y = startY;
    var id;
    var rotation;
    var speed=0;
    var points=0
    var isInfrenzy=false;
    
    // Getters and setters
    var getX = function () {
        return x;
    };
    var getRotation = function(){
        return rotation;
    };
    var getY = function () {
        return y;
    };
    var getPoints = function () {
        return points;
    };
    var getSpeed= function () {
        return speed;
    };
    var setX = function (newX) {
        x = newX;
    };
    var setRotation = function (newRotation) {
        rotation = newRotation;
    };
    var setY = function (newY) {
        y = newY;
    };
    var setPoints = function (val) {
        points = val;
    };
    var setSpeed= function (newSpeed) {
        speed=newSpeed;
    };

    // Define which variables and methods can be accessed
    return {
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY,
        getRotation: getRotation,
        setRotation: setRotation,
        getSpeed:getSpeed,
        setSpeed:setSpeed,
        gePoints:getPoints,
        setPoints:setPoints,
        id: id
    }
};
//points enum start
//kill=10
//other=1
//etc
//points enum end