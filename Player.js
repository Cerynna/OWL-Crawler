class Player {
    constructor(pseudo) {
        this.pseudo = pseudo;
        var players = require('./ListPlayers.json');
        this.fristName = players[this.pseudo].fristName
        this.lastName = players[this.pseudo].lastName
        this.country = players[this.pseudo].country
        this.team = players[this.pseudo].team
        this.idTeam = players[this.pseudo].idTeam
        this.role = players[this.pseudo].role
        this.idRole = players[this.pseudo].idRole
    }
    nbMatch() {
        var matchs = this.Match().length
        return matchs
    }
    Match() {
        var games = require('./ListMatch.json');
        var idGames = [];
        for (var i = 0; i < games.length; i++) {
            var idGame = games[i].split("/").pop();
            var url = "./matchs/" + idGame + "/main.json";
            var games = require('./ListMatch.json');
            var maps = require(url).maps;
            for (var u = 0; u < maps.length; u++) {
                var urlMaps = "./matchs/" + idGame + "/" + maps[u] + ".json";
                console.log(urlMaps);
                var map = require(urlMaps);
                var teamA = map.away.id;
                var teamB = map.home.id;
                if (teamA == this.idTeam || teamB == this.idTeam) {
                    if (map.away.roster.includes(this.pseudo)) {
                        idGames.push(map.score)
                    }
                }
            }

        }
        return idGames;
    }
}
module.exports = Player;