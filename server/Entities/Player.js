/**
 * Created by Nicolas on 01/09/2016.
 */

var Player = function (start_x, start_y) {
    var x = start_x;
    var y = start_y;
    var id;
    var name='';
    var rotation;
    var speed=0;
    var score=0
    var is_on_frenzy=false;

    // Getters and setters
    var getX = function () {
        return x;
    };
    var getName = function () {
        return name;
    };
    var getRotation = function(){
        return rotation;
    };
    var getY = function () {
        return y;
    };
    var getScore = function () {
        return score;
    };
    var getSpeed= function () {
        return speed;
    };
    var setX = function (newX) {
        x = newX;
    };
    var setName = function (v) {
        name= v;
    };
    var setRotation = function (newRotation) {
        rotation = newRotation;
    };
    var setY = function (newY) {
        y = newY;
    };
    var setScore = function (val) {
        score = val;
    };
    var addScore = function (val) {
        score += val;
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
        getScore:getScore,
        setScore:setScore,
        getName:getName,
        setName:setName,
        id: id
    }
};
//points enum start
//kill=10
//other=1
//etc
//points enum end
module.exports = Player;