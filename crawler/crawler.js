var casper = require('casper').create();
const url = 'https://overwatchleague.com/fr-fr';
const fs = require('fs');

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
        var myfile = "./JSON/ListMatch.json";
        fs.write(myfile, js, 'w');
    })
});
casper.run();