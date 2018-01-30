
let express = require('express');
let fs = require('fs');
var Player = require('./Player.js');
var Role = require('./Role.json');


let app = express();



app.set('view engine', 'ejs');

app.use(express.static('public'));
app.get('/', (request, response) => {
    var ListMatch = require('./ListMatch.json');
    var arrMatch = [];
    ListMatch.forEach(Match => {
        idGame = Match.split("/").pop();
        var main = require('./matchs/' + idGame + '/main.json');
        if (main.maps.length > 0) {
            var arrMap = [];
            main.maps.forEach(Map => {
                var maps = require('./matchs/' + idGame + '/' + Map + '.json');
                var scrores = maps.score.split("-");
                var array = {
                    'scoreA': scrores[0],
                    'scoreB': scrores[1],
                    'away': maps.away,
                    'home': maps.home,
                }
                arrMap.push(array);
            })
            arrMatch.push({
                'id': idGame,
                'maps': arrMap
            });
        }
    });

    response.render('pages/index', {
        'matchs': arrMatch
    })
})
app.get('/game/:idGame', function (request, response) {
    var idGame = request.params.idGame;
    var Match = require('./matchs/' + idGame + '/main.json');
    response.render('pages/game', {
        'maps': Match.maps,
        'game': Match.id
    })
})

app.get('/game/:idGame/map/:idMap', function (request, response) {
    var idMap = request.params.idMap;
    var idGame = request.params.idGame;
    var Map = require('./matchs/' + idGame + '/' + idMap + '.json');

    response.render('pages/map', {
        'map': Map,
        'idGame': idGame,
        'idMap': idMap
    })
})

app.get('/players', function (request, response) {

    var players = require('./ListPlayers.json');
    response.render('pages/players', {
        'players': players, 
        'Role': Role
    })
})
app.get('/player/:namePlayer', function (request, response) {
    var namePlayer = request.params.namePlayer;
    var ListMatch = require('./ListMatch.json');
    var player = new Player(namePlayer)

console.log(player);

    response.render('pages/player', {
        'player': player,
        'Role': Role

    })
})


app.listen(8085)