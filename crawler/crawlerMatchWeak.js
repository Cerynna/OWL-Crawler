var casper = require('casper').create();
const url = 'https://overwatchleague.com/fr-fr/schedule';
const fs = require('fs');

casper.start(url);

casper.then(function () {
    var Recup = this.evaluate(function () {
        var arrRows = [];
        var rows = document.querySelectorAll('a.MatchRow-contentWrapper')
        var navs = document.querySelectorAll('nav.Tabs-bar a.Tabs-tab--active')
        var dates = document.querySelectorAll('span.Date-monthAndDay')
        // var title = document.querySelector('h1.u-no-text-transform').textContent
        // arrRows.push(title)

        navs.forEach(function (nav) {
            var step = nav.textContent.split(" ").pop();
            arrRows.push(step)
        })
        dates.forEach(function (date) {
            arrRows.push(date.textContent)
        })
        rows.forEach(function (row) {
            var Match = [];
            Match.push(row.getAttribute('href').split("/").pop())
            var teams = row.querySelectorAll('div.TeamLabel-info div.hidden-lg')
            teams.forEach(function (team) {
                Match.push(team.textContent)
            })
            arrRows.push(Match)
        })


        return arrRows;
    })
    var step = Recup.shift();
    var week = Recup.shift();

    if (step !== undefined) {
        this.echo("Etape : " + step + " Semaine : " + week);
        var Match = {};
        var arrDate = [];
        Recup.forEach(function (match) {
            if (Array.isArray(match)) {
                var idGame = match[0];
                Match[idGame] = {
                    'id': match[0],
                    'home': match[1],
                    'away': match[2]
                }
            } else {
                var ConvertMonth = {
                    "janvier": 1,
                    "février": 2,
                    "mars": 3,
                    "avril": 4,
                    "mai": 5,
                    "juin": 6,
                    "juillet": 7,
                    "aout": 8,
                    "séptembre": 9,
                    "octobre": 10,
                    "novembre": 11,
                    "décembre": 12,
                }
                var month = ConvertMonth[match.split(" ").pop()];
                //var month = "février";
                var day = match.split(" ").shift();

                var year = (new Date()).getFullYear();
                // var year = 2018;
                var dateString = month + '/' + day + '/' + year;
                var date = new Date(dateString).toString();
                //var date = dateString;
                arrDate.push(date)

            }
        })
        Match["start"] = arrDate.shift();
        Match["end"] = arrDate.pop();
        Match["step"] = step;
        Match["week"] = week;

        var myfile = "./JSON/Step.json";
        fs.write(myfile, JSON.stringify(Match), 'w');
    }
    else {
        this.echo("Erreur Try Again");
    }
})
casper.run();


