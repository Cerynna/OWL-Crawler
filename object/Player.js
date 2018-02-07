class Player {
    constructor(pseudo) {
        this.pseudo = pseudo;
        var players = require('../JSON/ListPlayers.json');
        this.firstName = players[this.pseudo].firstName
        this.lastName = players[this.pseudo].lastName
        this.country = players[this.pseudo].country
        this.team = players[this.pseudo].team
        this.idTeam = players[this.pseudo].idTeam
        this.role = players[this.pseudo].role
        this.idRole = players[this.pseudo].idRole
    }
    Match() {
        var games = require('../JSON/ListMaps.json');
        var idGames = [];
        var victory = 0;
        var defeat = 0;
        var draw = 0;
        var nbGame = 0;

        for (var i = 0; i < games.length; i++) {
            var idGame = games[i].split("/").pop();
            var urlMaps = "../JSON/matchs/" + idGame + ".json";

            var map = require(urlMaps);
            var teamA = map.away.id;
            var teamB = map.home.id;
            if (teamA === this.idTeam || teamB === this.idTeam) {
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
            var pourcent = (victory / matchPlayed) + 1;
            var ratio = ((victory * 3) + (draw * 2) + defeat) / matchPlayed;
            var valeur = 100 * ratio;

        }
        else {
            var pourcent = 2;
            var ratio = 1;
            var valeur = 100;
        }

        var gain = valeur + ((valeur * pourcent) * 0.4);


        var scorePlayer = {
            "wl":
                {
                    "nbGameTeam": nbGame,
                    "nbGame": matchPlayed,

                    "gain": Math.round(gain),

                    "prix": Math.round(valeur),
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