//TODO
/*
names,
leaderboard,
map,
frenzy,
mass*speed?
max speed augmentation,
etc.
*/
// We start by initializing Phaser
// Parameters: width of the game, height of the game, how to render the game, the HTML div that will contain the game
var WIDTH = 1024;//config
var HEIGHT = 768//config
var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'game_div');

var remotePlayers;
var player;
var obstructors;
var map;
var layer;
var crashEmitter;
var gui;
var main_state = {
    preload: function () {
        //game.load.image('background', 'assets/debug-grid-1920x1920.png');
        game.load.image('car', 'assets/car.png');
        game.load.image('red', 'assets/red.png');
        game.load.tilemap('background_json', 'assets/tilemaps/background.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('background_tiles', 'assets/tilemaps/background.png');
    },
    create: function () {

        socket = io.connect(SOCKETIO_SERVER_IP);
        game.stage.backgroundColor = '#787878';
        map = game.add.tilemap('background_json');
        map.addTilesetImage('backgroundTiles', 'background_tiles');
        layer = map.createLayer('World1');
        layer.resizeWorld();

        crashEmitter = new CrashEmitter(game);
        remotePlayers = game.add.group();

        player = new PhaserCar(game, true);



        //game.add.tileSprite(0, 0, 1920, 1920, 'background');
        //game.world.setBounds(0, 0, 1920, 1920);
        obstructors = new MovingObjects(game, 'ufo', 'slide',[{x:100, y:100}]);

        game.physics.arcade.gravity.y = 0;
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        // Keep original size
        // game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;
        // Maintain aspect ratio
        // game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.startFullScreen(false);
        gui = new GUI(game);

        game.camera.follow(player.sprite);
        game.physics.enable([player, obstructors], Phaser.Physics.ARCADE);
        player.sprite.body.maxVelocity.x = 500;
        player.sprite.body.maxVelocity.y = 500;
        player.sprite.body.acceleration.x = 0;
        player.sprite.body.acceleration.y = 0;
        player.sprite.body.collideWorldBounds = true;
        setEventHandlers();
    }
};
main_state.render = function () {
    //game.debug.bodyInfo(player, 16, 24);
    //game.debug.body(player);
    /*player.forEachAlive(function(member) {    game.debug.body(member);}, this);
    remotePlayers.forEachAlive(function(member) {
        member.forEachAlive(function(member) {    game.debug.body(member);}, this);
    }, this);*/
};
main_state.update = function () {
    gui.updateSpeedValue(player._showable_speed);
    //game.physics.arcade.collide(player.sprite, obstructors, this.carColissionHandler, null, this);
    remotePlayers.forEachAlive(function(member) {
        game.physics.arcade.collide(player.sprite, member.sprite, main_state.carColissionHandler, null, main_state);
    });

};
main_state.carColissionHandler = function (car, other) {
    emitColission(car.x,car.y,car.parent.id,other.parent.id);
    crashEmitter.showAtPosition(car.x,car.y);
};
main_state.addRemotePlayer=function(game,data){
    var  remote = new PhaserCar(game, false);
    remote.sprite.x=data.x;
    remote.sprite.y=data.y;
    remote.id=data.id;
    remote.setName(data.name);
    console.log("addedRemote");
    remotePlayers.add(remote);
};
//EXTENDED GROUP
MovingObjects = function (game, image, action, data) {
    Phaser.Group.call(this, game);
    for (var i = 0; i < data.length; i++) {
        var sprite = this.create(data.x, data.y, image);
        game.physics.enable(sprite, Phaser.Physics.ARCADE);
        sprite.body.immovable = true;
        if (action == 'bounce') {
            game.add.tween(sprite).to({y: sprite.y - 100}, 2000, Phaser.Easing.Elastic.Out, true, 0, 1000, true);
        }
        else if (action == 'slide') {
            game.add.tween(sprite).to({x: sprite.x + 200}, 4000, Phaser.Easing.Elastic.Out, true, 0, 1000, true);
        }
    }
};
MovingObjects.prototype = Object.create(Phaser.Group.prototype);
MovingObjects.prototype.constructor = MovingObjects;
MovingObjects.prototype.update = function () {
    //TODO
};
//Extended group
CrashEmitter = function (game) {
    Phaser.Group.call(this, game);
    //create a bunch of crash emitters
    for(var i=0;i<10;i++){
        var emitter = game.add.emitter(0, 0, 100);
        emitter.makeParticles('car');
        emitter.visible=false;
        emitter.gravity = 0;
        this.add(emitter);
    }
    this.showAtPosition     =    function(x,y){
        var emitter=    this._getFreeOne();
        emitter.visible=true;
        emitter.x   =  x;
        emitter.y   =  y;
        emitter.start(true, 2000, null, 10);
    };
    this._getFreeOne=function(){
        var childrenReturned=null;
        for(var i=0;i<this.children.length;i++){
            if(!this.children[i].on)
                childrenReturned= this.children[i];
        }
        if(childrenReturned)return childrenReturned;
        return this.children[0];//TODO!!!!!! create more or something
    };
};
CrashEmitter.prototype = Object.create(Phaser.Group.prototype);
CrashEmitter.prototype.constructor = CrashEmitter;
CrashEmitter.prototype.update = function () {
    //TODO
};
//EXTENDED GROUP
GUI = function (game) {
    Phaser.Group.call(this, game);
    //SHOW SPEED
    this._speed_measure_text = game.add.text(35, 0, "KM", {font: "12px Arial", fill: "#fff"}, this);
    this._speed_measure_text.fixedToCamera = true;
    this._speed_value_text = game.add.text(15, 0, "0", {font: "12px Arial", fill: "#fff"}, this);
    this._speed_value_text.fixedToCamera = true;
    this.updateSpeedValue = function (val) {
        this._speed_value_text.setText("" + val + "");
    };

    //SHOW SCORE
    this._score_text= game.add.text(65, 0, "0", {font: "12px Arial", fill: "#fff"}, this);
    this._score_text.fixedToCamera = true;
    this._score_points_text= game.add.text(85, 0, "points", {font: "12px Arial", fill: "#fff"}, this);
    this._score_points_text.fixedToCamera = true;
    this.updateScore = function (val) {
        this._score_text.setText("" + val + "");
    };


    this._player_names=[];//players name...
     this.addPlayerName=function(playerId,x,y,name){
     var txt = game.add.text(x, y, ""+name+"", {font: "8px Arial", fill: "#fff"}, this);
         this._player_names[playerId]=txt;//for removing
     };
    //GLOBAL MAP
    //COUNTERS
};
GUI.prototype = Object.create(Phaser.Group.prototype);
GUI.prototype.constructor = GUI;
GUI.prototype.update = function () {
    //TODO


};
//EXTENDED SPRITE
PhaserCar = function (game,isPlayer) {
    //  We call the Phaser.Sprite passing in the game reference
    //Phaser.Sprite.call(this, game, game.world.randomX, game.world.randomY, 'car');
    Phaser.Group.call(this, game);
    this.enableBody=true;
    this.enableBodyDebug=true;
    this.sprite=game.add.sprite(40, 40, 'car');

    //game.physics.enable(this, Phaser.Physics.ARCADE);
    // game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.name=player_name;

    this.emitter = game.add.emitter(game.world.centerX, 500, 400);
    this.add(this.emitter);
    this.add(this.sprite);
    this.emitter.makeParticles('red');
    this.emitter.setXSpeed(0, 0);
    this.emitter.setYSpeed(0, 0);
    this.emitter.setRotation(0, 0);
    //this.emitter.setAlpha(0.1, 1, 100);
    this.emitter.blendMode=1;
    this.emitter.setScale(0.5, 0.1, 0.5, 0.1, 1000, Phaser.Easing.Quintic.Out);
    this.emitter.gravity = 0;
    this.emitter.start(false, 500, 20);
    this.emitter.emitX = this.sprite.x;
    this.emitter.emitY = this.sprite.y;
    this.sprite.body.height = 50;
    this.sprite.body.width = 50;
    this.sprite.body.offset.setTo(5, 5);
    this._is_player=isPlayer;
    //if(isPlayer)game.add.existing(this);//if is player it gets added as its created
    this._max_speed = 500;
    this._speed_per_loop = 1;
    this._speed = 0;
    this._showable_speed = 0;
    this.id=0;
    this.sprite.body.immovable = true;
    //PLAYER NAME
    this._player_name_text = game.add.text(0, 0, this.name, {font: "12px Arial", fill: "#fff"}, this);
    this._player_name_text.anchor.setTo(0.5, 0.5);
    this._player_name_text.fixedToCamera = false;

    this.setName = function (val) {
        this.name=val;
        this._player_name_text.setText("" + val + "");
    };
    this.getName = function(){
      return this.name;
    };
    this.getSpeed = function(){
    return this._speed;
    };
    console.log(this);
};

PhaserCar.prototype = Object.create(Phaser.Group.prototype);
PhaserCar.prototype.constructor = PhaserCar;
PhaserCar.prototype.update = function () {
    var _desacceletarion = 5;//NAME?
    var IMG_OFFSET_ANLGE_FIX = 1.6;
    this.emitter.emitX = this.sprite.x;
    this.emitter.emitY = this.sprite.y;

    //FLAGEAR ESTO -> if speed gretaer flag=true ,dont call every time
    if(this._showable_speed > 220){
        this.emitter.setScale(0.8, 0.4, 0.8, 0.4, 0, Phaser.Easing.Quintic.Out);
    }else if(this._showable_speed > 120){
        this.emitter.setScale(0.8, 0.2, 0.8, 0.2, 1000, Phaser.Easing.Quintic.Out);
    }else{
        this.emitter.setScale(0.5, 0.1, 0.5, 0.1, 1000, Phaser.Easing.Quintic.Out);
    }
    //FLAGEAR ESTO <-

    //player name follow player
    this._player_name_text.x=this.sprite.x;
    this._player_name_text.y=this.sprite.y;
    //  only move when clicking
    if(!this._is_player)return;

    if (game.input.mousePointer.isDown) {
        if (!Phaser.Rectangle.contains(this.sprite.body, game.input.worldX, game.input.worldY)) {
            if (this._speed <= this._max_speed) {
                this._speed += this._speed_per_loop;
            } else {
                this._speed = this._max_speed;
            }
            game.physics.arcade.moveToPointer(this.sprite, this._speed);
            this.sprite.rotation = game.physics.arcade.angleToPointer(this.sprite) + IMG_OFFSET_ANLGE_FIX;
            //  if it's overlapping the mouse, don't move any more
        }
    } else {
        //slow down
        if (this._speed > 0) {
            this._speed -= this._speed_per_loop * _desacceletarion;
        } else {
            this._speed = 0;
        }
        if (this.sprite.body.velocity.x > 0) {
            this.sprite.body.velocity.x -= this._speed_per_loop * _desacceletarion;
        } else {
            this.sprite.body.velocity.x += this._speed_per_loop * _desacceletarion;
        }
        if (this.sprite.body.velocity.y > 0) {
            this.sprite.body.velocity.y -= this._speed_per_loop * _desacceletarion;
        } else {
            this.sprite.body.velocity.y += this._speed_per_loop * _desacceletarion;
        }
    }
    socket.emit('move player', { x: player.sprite.x, y: player.sprite.y ,rotation:player.sprite.rotation,speed:player.getSpeed()});
    this._showable_speed = this._speed / 2;
};
// And finally we tell Phaser to add and start our 'main' state
game.state.add('main', main_state);


