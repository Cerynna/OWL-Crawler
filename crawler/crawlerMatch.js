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


// var links = JSON.parse(fs.read("./JSON/ListMatch.json"));

var linksJSON = JSON.parse(fs.read("./JSON/Step.json"));

var links = [];
for (link in linksJSON){
    if (link != "start" && link != "end" && link != "step" && link != "week")
    links.push("/match/" + link)
}

var nbMatchs = links.length
var maxTime = Math.round(((nbMatchs) * 10) / 60);
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
    fs.write(myfile, JSON.stringify(arrLinks), 'w');
})


casper.run();