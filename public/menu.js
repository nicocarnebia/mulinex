
var menu_state = {
    preload: function () {
        game.load.image('background', 'assets/debug-grid-1920x1920.png');
        game.load.spritesheet('button', 'assets/buttons/button_sprite_sheet.png', 193, 71);
    },
    create: function () {
        gui = new menuGUI(game);
    }
};
menu_state.render = function () {

};
menu_state.update = function () {

};
function actionOnClick() {
    //switch state
    game.state.start("main");
}
menuGUI = function (game) {
    Phaser.Group.call(this, game);

    var BAR_HEIGHT = 200;
    var BAR_WIDTH = 260;
    this._bar = game.add.graphics(0, 0, this);
    this._bar.beginFill(0xffffff, 1);

    this._bar.drawRoundedRect(game.world.centerX - BAR_WIDTH / 2, game.world.centerY - BAR_HEIGHT / 2, BAR_WIDTH, BAR_HEIGHT);

    this._speed_measure_text = game.add.text(game.world.centerX - 110, game.world.centerY - 90, "PRESS PLAY", {font: "32px Arial", fill: "#000000"}, this);
    this._speed_measure_text.fixedToCamera = true;

    this._button = game.add.button(game.world.centerX - 110, game.world.centerY - 50, 'button', actionOnClick, this, 2, 1, 0, this);
    /* button.onInputOver.add(over, this);
     button.onInputOut.add(out, this);
     button.onInputUp.add(up, this);*/

};
menuGUI.prototype = Object.create(Phaser.Group.prototype);
menuGUI.prototype.constructor = GUI;
menuGUI.prototype.update = function () {
    //TODO
};
game.state.add('menu', menu_state);
game.state.start('menu');
