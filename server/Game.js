/**
 * Created by Nicolas on 01/09/2016.
 */
var Player = require('./Entities/Player.js');
var PlayerGroup = require('./Entities/PlayerGroup.js');
var Game = function () {

    var players;
    // Getters and setters
    var init = function () {
        players=new PlayerGroup();
    };
    var handleNewPlayer = function (client,data) {
        console.log("NEW PLAYER SERVER");
        // Create a new player
        var newPlayer = new Player(data.x, data.y);
        newPlayer.id = client.id;
        // Broadcast new player to connected socket clients
        //io.sockets.emit('new player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});
        client.broadcast.emit('new player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});
        // Send existing players to the new player
        var i, existingPlayer;
        for (i = 0; i < players.getTotalPlayers(); i++) {
            existingPlayer = players.getPlayer(i);
            client.emit('new player', {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
        }
        players.addPlayer(newPlayer);
    };
    var handlePlayerDiscconnect = function (client,io) {
        console.log('Player has disconnected: ' + client.id);
        var toBeRemovedPlayer = players.getPlayerById(client.id);
        // Player not found
        if (!toBeRemovedPlayer) {
            console.log('Player not found on disconnect: ' + client.id);
            console.log(players);
            return;
        }
        players.removePlayer(toBeRemovedPlayer);
        // Broadcast removed player to ALL EXCEPT socket connected socket clients
        //this.broadcast.emit('remove player', {id: this.id});
        // Broadcast removed player to ALL connected socket clients
        io.sockets.emit('remove player', {id: client.id});
    };
    var handlePlayerMove = function (client,data) {
        // Find player in array
        var movePlayer = players.getPlayerById(client.id);

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
        client.broadcast.emit('move player', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), rotation:movePlayer.getRotation()})
    };
    var handlePlayersColission = function(client,io,data){
        client.broadcast.emit('collision', {"x":data.x,"y":data.y});
        //compare speed
        var playerA = players.getPlayerById(data.player_a_id);
        var playerB = players.getPlayerById(data.player_b_id);
        if(!playerA || !playerB)return;//nothing to do...
        if(playerA.getSpeed()>playerB.getSpeed()){
            io.sockets.emit('remove player', {id: playerB.id});
        }else if(playerA.getSpeed()<playerB.getSpeed()){
            io.sockets.emit('remove player', {id: playerA.id});
        }//if equal do nothing
    };



    // Define which variables and methods can be accessed
    return {
        init: init,
        handleNewPlayer: handleNewPlayer,
        handlePlayerMove: handlePlayerMove,
        handlePlayerDiscconnect: handlePlayerDiscconnect,
        handlePlayersColission:handlePlayersColission,

    }
};

module.exports = Game;