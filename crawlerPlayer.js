const casper = require('casper').create();
const url = 'https://overwatchleague.com/fr-fr/players';
const fs = require('fs');
const utils = require('utils');

casper.start(url);
casper.on("page.error", function (msg, trace) {
    this.echo("Error: " + msg, "ERROR");
});

casper.echo("Recupération de la listes des Joueur");

casper.then(function () {
    var js = this.evaluate(function () {
        var pages = document.querySelectorAll('.pagination li');
        arrPlayers = [];
        pages.forEach(function (page) {
            if (page.textContent.length < 2) {
                page.click();
                var players = document.querySelectorAll('tr');
                players.forEach(function (player) {
                    var infos = player.querySelectorAll('td')
                    if (infos.length > 1) {
                        var pseudo = infos[0].textContent
                        arrJoueur = [
                            pseudo,
                             {
                                'pseudo': infos[0].textContent,
                                'fristName': infos[1].textContent,
                                'lastName': infos[2].textContent,
                                'country': infos[3].textContent,
                                'team': infos[4].textContent.slice(-3),
                                'role': infos[5].textContent
                            }
                        ];
                        arrPlayers.push(arrJoueur)
                    }

                });
            }
        });
        return JSON.stringify(arrPlayers)
    });
    this.echo("Liste des Joueurs Mise a Jour");
    var myfile = "ListPlayers.json";
    fs.write(myfile, js, 'w');
});
casper.run();