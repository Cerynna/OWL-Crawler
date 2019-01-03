var fs = require('fs');

class Player {
    constructor(pseudo) {
        this.pseudo = pseudo;
        var players = require('../JSON/ListPlayers.json');
        var Role = require('../JSON/Role.json');
        this.firstName = players[this.pseudo].firstName
        this.lastName = players[this.pseudo].lastName
        this.country = players[this.pseudo].country
        this.team = players[this.pseudo].team
        this.idTeam = players[this.pseudo].idTeam
        this.role = players[this.pseudo].role
        this.idRole = Role[players[this.pseudo].idRole]
    }
    Match() {
        var games = require('../JSON/ListMaps.json');

        var files = fs.readdirSync('./JSON/matchs/');

        var idGames = [];
        var victory = 0;
        var defeat = 0;
        var draw = 0;
        var nbGame = 0;

        for (var i = 0; i < files.length; i++) {

            var urlMaps = "../JSON/matchs/" + files[i];


            var map = require(urlMaps);

            var teamA = map.away.id;
            var teamB = map.home.id;

            if (teamA == this.idTeam || teamB == this.idTeam) {
                var nbGame = nbGame + 1;
                var scores = map.score.split("-");
                var scoreHome = scores[1];
                var scoreAway = scores[0];
                if (map.away.roster.includes(this.pseudo)) {

                    if (scoreAway > scoreHome) {
                        var victory = victory + 1;
                    }
                    else if (scoreHome > scoreAway) {
                        var defeat = defeat + 1;
                    }
                    else if (scoreHome === scoreAway) {
                        var draw = draw + 1;
                    }

                    idGames.push(map)
                }
                else if (map.home.roster.includes(this.pseudo)) {

                    if (scoreHome > scoreAway) {
                        var victory = victory + 1;
                    }
                    else if (scoreAway > scoreHome) {
                        var defeat = defeat + 1;
                    }
                    else if (scoreHome === scoreAway) {
                        var draw = draw + 1;
                    }
                    idGames.push(map)
                }

            }

        }



        var matchPlayed = (victory + defeat + draw);
        if (matchPlayed !== 0) {

            var ratio = (((victory * 3) + (draw * 2) + defeat) / matchPlayed) / 2;
            var valeur = 100 + (50 * ratio) + (10 * (victory / matchPlayed)) - (5 * (defeat / matchPlayed));

        }
        else {
            var ratio = 2;
            var valeur = 100;
        }

        var gain = (valeur * ratio)

        if (victory > defeat) {
            gain = gain + ((victory / matchPlayed) * 100);
        }
        if (defeat > victory) {
            gain = gain + ((defeat / matchPlayed) * 250);
        }

        var scorePlayer = {
            "wl":
                {
                    "nbGameTeam": nbGame,
                    "nbGame": matchPlayed,

                    "gain": Math.ceil(gain / 5) * 5,

                    "prix": Math.ceil(valeur / 5) * 5,
                    "draw": draw,
                    "victory": victory,
                    "defeat": defeat
                }
        }
        Object.assign(idGames, scorePlayer);
        return idGames;
    }
}
module.exports = Player;