var casper = require('casper').create();
var url = 'https://overwatchleague.com';
var fs = require('fs');



 var links = JSON.parse(fs.read("./JSON/ListMaps.json"));


casper.start(url)

links.forEach(function (link) {
    var game = link.split("/")[3];
    var map = link.split("/").pop();

    var mapJASON = "./JSON/matchs/" + map + ".json";

    if (!fs.exists(mapJASON)) {
        casper.thenOpen(url + link, function () {

            this.echo("Game : " + game + " Maps : " + map + " - Wait 8 Sec");
            this.wait(10000, function () {
                var CrawlMap = this.evaluate(function () {
                    var arrMaps = [];
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
                    return array;
                });
                //Object.assign(arrPlayers, CrawlMap);
                this.echo(JSON.stringify(CrawlMap));
                var myfile = "./JSON/matchs/" + map + ".json";
                fs.write(myfile, JSON.stringify(CrawlMap), 'w');
            })

        });
    }

});

casper.run();
