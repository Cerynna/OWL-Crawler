const casper = require('casper').create();
const url = 'https://overwatchleague.com/fr-fr';
const fs = require('fs');
const utils = require('utils');

function progressBar(action, max) {
    var pourcent = Math.round((action * 100) / max, 0);
    var txt = "";
    for (i = 1; i <= 100; i++) {
        if (i <= pourcent) {
            txt = txt + "⬤";
        }
        else {
            txt = txt + "○";
        }


    }

    return txt + " " + pourcent + "%";
}



casper.start(url);

casper.on("page.error", function (msg, trace) {
    this.echo("Error: " + msg, "ERROR");
});
casper.echo("Recupération de la listes des matches - Wait 10 sec");
casper.thenOpen(url + "/schedule", function () {

    this.wait(5000, function () {
        var js = this.evaluate(function () {

            var arrMatches = [];
            var steps = document.querySelectorAll('.Tabs--rectangular a');
            for (var s = 0; s < steps.length; s++) {
                steps[s].click();
                var weeks = document.querySelectorAll('.Tabs--darkBackground a');
                for (w = 0; w < weeks.length; w++) {
                    weeks[w].click();
                    var matches = document.querySelectorAll('.MatchRow-contentWrapper');
                    for (var o = 0; o < matches.length; o++) {
                        arrMatches.push(matches[o].getAttribute('href'));

                    }
                }
            }
            return JSON.stringify(arrMatches)
        });
        var myfile = "ListMatch.json";
        fs.write(myfile, js, 'w');
    })
});
casper.wait(10000, function () {
    var links = JSON.parse(fs.read("ListMatch.json"));
    var nbMatchs = links.length
    var maxTime = ((nbMatchs) * 9) / 60;
    var nMatch = 1;
    this.echo("Recuperation des Maps -  ~" + maxTime +" min");
    casper.eachThen(links, function (response) {
        var urlMatches = url + response.data;
        var id = response.data.split("/").pop();
        this.echo(progressBar(nMatch, nbMatchs));
        this.thenOpen(urlMatches, function () {
            this.wait(9000, function () {
                var js = this.evaluate(function () {
                    var maps = document.querySelectorAll('.Tabs--rectangular a');
                    var arrMaps = [];
                    for (var m = 0; m < maps.length; m++) {
                        arrMaps.push(maps[m].getAttribute('href').split("/").pop());
                    }
                    var array = {
                        'id': arrMaps.shift(),
                        'maps': arrMaps
                    }
                    return JSON.stringify(array)
                })
                var myfile = "matchs/" + id + "/main.json";
                fs.write(myfile, js, 'w');
            });

        })
        nMatch++;
    });
    casper.eachThen(links, function (response) {
        var id = response.data.split("/").pop();
        var game = JSON.parse(fs.read("matchs/" + id + "/main.json"));

        this.echo("Recuperation des informations pour les Maps du match  : " + id + " - Wait 40 sec");
        casper.eachThen(game.maps, function (map) {
            var urlMaps = url + "/match/" + game.id + "/game/" + map.data;
            var idMap = map.data;
            this.echo("Recuperation des informations pour la Map  : " + idMap + " - Wait 8 sec");
            this.thenOpen(urlMaps, function () {

                this.wait(500, function () {
                    var js = this.evaluate(function () {

                        var score = document.querySelector('.GameResult .MatchStatus').textContent;
                        var teams = document.querySelectorAll('.GameResult .TeamScore-name .hidden-sm');
                        var rostersA = document.querySelectorAll('.GameRoster-awayRoster h4');
                        var rostersB = document.querySelectorAll('.GameRoster-homeRoster h4');
                        var teamA = teams[0].textContent;
                        var TeamB = teams[1].textContent;
                        arrRosterA = [];
                        arrRosterB = [];
                        rostersA.forEach(function (membre) {
                            arrRosterA.push(membre.textContent);

                        });
                        rostersB.forEach(function (membre) {
                            arrRosterB.push(membre.textContent);
                        });
                        var array = {
                            'score': score,
                            'away': {
                                'id': teamA,
                                'roster': arrRosterA
                            },
                            'home': {
                                'id': TeamB,
                                'roster': arrRosterB
                            }
                        }
                        return JSON.stringify(array)
                    });
                    var myfile = "matchs/" + id + "/" + idMap + ".json";
                    fs.write(myfile, js, 'w');
                });
                this.echo(this.getCurrentUrl());
            });
        });
    });
})
casper.run();