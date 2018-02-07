const casper = require('casper').create();
const url = 'https://overwatchleague.com/fr-fr/players';
const fs = require('fs');
const utils = require('utils');

casper.start(url);
casper.on("page.error", function (msg, trace) {
    this.echo("Error: " + msg, "ERROR");
});

casper.echo("Recupération de la listes des Joueurs");

casper.then(function () {
    var js = this.evaluate(function () {
        var pages = document.querySelectorAll('.pagination li');
        arrPlayers = {};
        pages.forEach(function (page) {
            //if (page.textContent.length < 2) {
                var next = document.querySelector('.pagination li.next');
                
                var players = document.querySelectorAll('tr');
                players.forEach(function (player) {
                    var infos = player.querySelectorAll('td')
                    var arrJoueur = {};
                    if (infos.length > 1) {
                        var pseudo = infos[0].textContent
                        var role = infos[5].textContent;
                        var idRole = 0;
                        switch (role) {
                            case 'Soutien':
                                idRole = 1;
                                break;
                            case 'Polyvalent':
                                idRole = 2;
                                break;
                            case 'Tank':
                                idRole = 3;
                                break;
                            case 'Attaque':
                                idRole = 4;
                                break;
                            default:
                                idRole = 0;

                        }
                        arrJoueur[pseudo] = {
                            'pseudo': infos[0].textContent,
                            'firstName': infos[1].textContent,
                            'lastName': infos[2].textContent,
                            'country': infos[3].textContent,
                            'idTeam': infos[4].textContent.slice(-3),
                            'team': infos[4].textContent.slice(0, -3),
                            'role': infos[5].textContent,
                            'idRole': idRole
                        };

                        Object.assign(arrPlayers, arrJoueur);
                        //arrPlayers.merge(arrJoueur)
                    }

                });
                next.click();
            //};
        });
        return JSON.stringify(arrPlayers)
    });
    this.echo("Liste des Joueurs Mise a Jour");
    var myfile = "./JSON/ListPlayers.json";
    fs.write(myfile, js, 'w');
});
casper.run();