/**
 * Created by Nicolas on 01/09/2016.
 */

var PlayerGroup = function () {
    var _players = [];
    var getPlayer=function(index){
        return _players[index];
    };
    var addPlayer=function(obj){
        _players.push(obj);
    };
    var removePlayer=function(obj){
        _players.splice(_players.indexOf(obj), 1);
    };
    var getPlayerById = function (id) {
        var i;
        for (i = 0; i < _players.length; i++) {
            if (_players[i].id === id) {
                return _players[i];
            }
        }
        return false;
    };
    var getPlayers=function(){
        return _players;
    };

    var getTotalPlayers=function(){
        return _players.length;
    };
    var getLeaderBoard=function(limit){
        var leaderBoard=[];
        _players.sort( function compareDESC(a, b){
            return parseFloat(a.score) - parseFloat(b.score);
        });
        for (var i=0;i<limit;i++){
            if(_players[i])leaderBoard.push({'name':_players[i].name,'score':_players[i].score});
        }


    };

    // Define which variables and methods can be accessed
    return {
        getPlayer: getPlayer,
        getPlayers:getPlayers,
        addPlayer: addPlayer,
        getTotalPlayers:getTotalPlayers,
        removePlayer: removePlayer,
        getPlayerById:getPlayerById,
        getLeaderBoard:getLeaderBoard

    }
};

module.exports = PlayerGroup;