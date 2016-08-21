var socket;
var ioMapData;
var SOCKETIO_SERVER_IP='http://localhost:5555';
//TODO this is way too simple
var emitColission=function(x,y,playerAId,playerBId){
    socket.emit('collision',  {'x': x,'y': y,'player_a_id':playerAId,'player_b_id':playerBId} );
};
var setEventHandlers = function () {
    console.log('Setting event handlers')
    // Socket connection successful
    socket.on('connect', onSocketConnected);
    // Socket disconnection
    socket.on('disconnect', onSocketDisconnect);
    // New player message received
    socket.on('new player', onNewPlayer);
    // Player move message received
    socket.on('move player', onMovePlayer);
    // Player removed message received
    socket.on('remove player', onRemovePlayer);
    //map data received
    socket.on('s', function(data){
        ioMapData=data;
        console.log(data);
    });
    socket.on('collision', function(data){
        crashEmitter.showAtPosition(data.x,data.y);
    });
};

// Socket connected
function onSocketConnected () {

    console.log('Connected to socket server with ID '+ socket.id);
    player.id= "/#"+socket.id;
    // Send local player data to the game server
    socket.emit('new player', { x: player.x, y: player.y });
}
// Socket disconnected
function onSocketDisconnect () {
    console.log('Disconnected from socket server')
}
// New player
function onNewPlayer (data) {
    console.log('New player connected:', data.id);
    // Avoid possible duplicate players
    var duplicate = playerById(data.id);
    if (duplicate) {
        console.log('Duplicate player!');
        return;
    }
    main_state.addRemotePlayer(game,data);
}
// Move player
function onMovePlayer (data) {
    var movePlayer = playerById(data.id)

    // Player not found
    if (!movePlayer) {
       // console.log('Player not found: ', data.id)
        return
    }
    // Update player position
    movePlayer.x = data.x;
    movePlayer.y = data.y;
    movePlayer.rotation = data.rotation;
}
// Remove player
function onRemovePlayer (data) {
    if(data.id==player.id){
        gameOver();
    }
    var removePlayer = playerById(data.id);
    // Player not found
    if (!removePlayer) {
        console.log('Player not found: ', data.id)
        return
    }
    // Remove player from array
    //remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1)
    remotePlayers.remove(removePlayer);
}
// Find player by ID
function playerById (id) {
   
    for (var i = 0; i < remotePlayers.children.length; i++) {
        if (remotePlayers.children[i].id === id) {
            return remotePlayers.children[i];
        }
    }
    return false
}
function getMovingObjectsData(){
    return ioMapData;
}
var startGame=function(){
    game.paused = false;
    game.state.start('main');

}
var gameOver=function(){
    game.paused = false;
    remotePlayers.removeAll(true);
    $("#main_div").show();
};