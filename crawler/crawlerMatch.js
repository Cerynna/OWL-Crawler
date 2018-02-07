var casper = require("casper").create();
var mouse = require("mouse").create(casper);
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


var links = JSON.parse(fs.read("./JSON/ListMatch.json"));

var nbMatchs = links.length
var maxTime = ((nbMatchs) * 10) / 60;
var nMatch = 1;
var arrLinks = [];
casper.start();


casper.echo("Recuperation des Maps -  ~" + maxTime + " min");
casper.eachThen(links, function (link) {
    casper.open('https://overwatchleague.com/fr-fr' + link.data).then(function () {
        console.log(this.getCurrentUrl())
        this.wait(10000, function () {
            var CrawlMap = this.evaluate(function () {
                var arrMaps = [];
                var maps = document.querySelectorAll('a.Tabs-tab');
                maps.forEach(function (map) {
                    arrMaps.push(map.getAttribute('href'));
                })
                return arrMaps;
            });
            var Game = CrawlMap.shift();
            arrLinks = arrLinks.concat(CrawlMap);
        });

    })

})
casper.then(function () {
    var myfile = "./JSON/ListMaps.json";
    var arrLinks = arrLinks.reverse();
    fs.write(myfile, JSON.stringify(arrLinks), 'w');
})



// casper.eachThen(links, function (link) {
//     var urlMatches = url + link.data;
//     casper.open(urlMatches).then(function () {

//         console.log(this.getCurrentUrl())
//         var js = this.evaluate(function () {
//             this.wait(1000, function () {
//                 var test = document.querySelector('.MatchStatus');
//                 return test;
//                 //casper.echo(casper.getPageContent());

//             });
//         });
//         console.log(JSON.stringify(js));
//     });

// })

// casper.eachThen(links, function (response) {
//     var urlMatches = url + response.data;

//     var id = response.data.split("/").pop();

//     this.echo(progressBar(nMatch, nbMatchs));

//     this.thenOpen(urlMatches, function () {
//         this.wait(1000, function () {
//             var js = this.evaluate(function () {
//                 var maps = document.querySelectorAll('.Tabs--rectangular a');
//                 var arrMaps = [];
//                 for (var m = 0; m < maps.length; m++) {
//                     arrMaps.push(maps[m].getAttribute('href').split("/").pop());
//                 }
//                 var array = {
//                     'id': arrMaps.shift(),
//                     'maps': arrMaps
//                 }
//                 return JSON.stringify(array)
//             })
//             var myfile = "matchs/" + id + "/main.json";
//             fs.write(myfile, js, 'w');
//         });

//     })
//     nMatch++;
// });

// casper.eachThenOpen(links, function (response) {
//     var id = response.data.split("/").pop();
//     var game = JSON.parse(fs.read("matchs/" + id + "/main.json"));

//     this.echo("Recuperation des informations pour les Maps du match  : " + id + " - Wait 40 sec");
//     casper.eachThen(game.maps, function (map) {
//         var urlMaps = url + "/match/" + game.id + "/game/" + map.data;
//         var idMap = map.data;
//         this.echo("Recuperation des informations pour la Map  : " + idMap + " - Wait 8 sec");
//         this.thenOpen(urlMaps, function () {

//             this.wait(2000, function () {
//                 var js = this.evaluate(function () {

//                     var score = document.querySelector('.GameResult .MatchStatus').textContent;
//                     //var score = 0;
//                     var teams = document.querySelectorAll('.GameResult .TeamScore-name .hidden-sm');
//                     var rostersA = document.querySelectorAll('.GameRoster-awayRoster h4');
//                     var rostersB = document.querySelectorAll('.GameRoster-homeRoster h4');
//                     var teamA = teams[0].textContent;
//                     var TeamB = teams[1].textContent;
//                     arrRosterA = [];
//                     arrRosterB = [];
//                     rostersA.forEach(function (membre) {
//                         arrRosterA.push(membre.textContent);

//                     });
//                     rostersB.forEach(function (membre) {
//                         arrRosterB.push(membre.textContent);
//                     });
//                     var array = {
//                         'score': score,
//                         'away': {
//                             'id': teamA,
//                             'roster': arrRosterA
//                         },
//                         'home': {
//                             'id': TeamB,
//                             'roster': arrRosterB
//                         }
//                     }
//                     return JSON.stringify(array)
//                 });
//                 var myfile = "matchs/" + id + "/" + idMap + ".json";
//                 fs.write(myfile, js, 'w');
//             });

//         });
//     });
// });
casper.run();