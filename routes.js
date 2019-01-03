var fs = require('fs');
var util = require('util');
var Player = require('./object/Player.js');

var regexEmail = /^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/;

var passwordHash = require('password-hash');
var firebase = require("firebase-admin");
var serviceAccount = require("./JSON/firebase.json");

const asyncHandler = require('express-async-handler')

var db = firebase.database();


function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}



module.exports = function (app) {

	/* !!!! ROUTE PUBLIC !!!! */
	app.get('/', (req, res, next) => {
		res.render('pages/index');
	})

	app.get('/players', function (req, res, next) {
		res.render('pages/players')

	})
	/* !!!!! ROUTE RESULT !!!!! */
	app.get('/result', function (req, res, next) {
		var listGame = req.session.step.info;
		var user = req.session.user.pseudo;
		var db = firebase.database();
		var firebasePlayers = db.ref("users/" + user);
		var UserDB = "";
		firebasePlayers.on("value", function (snapshot) {
			UserDB = snapshot.val();
		}, function (errorObject) {
			UserDB = null;
			console.log("The read failed: " + errorObject.code);
		});




		var firebaseMaps = db.ref("maps/");
		var MapsDB = [];
		firebaseMaps.on("value", function (snapshot) {
			MapsDB.push(snapshot.val());
		}, function (errorObject) {
			MapsDB = null;
			console.log("The read failed: " + errorObject.code);
		});

		var arrMaps = []
		for (idGame in listGame) {
			if (idGame != "end" || idGame != "start" || idGame != "step" || idGame != "week") {
				arrMaps.push(idGame);
			}
		}
		MapsDB.forEach(maps => {
			for (player in UserDB.roster) {
				if (typeof UserDB.roster[player] === 'object') {
					var victory = 0;
					var defeat = 0;
					var draw = 0;
					var nbGame = 0;
					var maxAway = 0;
					var maxHome = 0;
					var team = UserDB.roster[player].team;
					var idGame = [];
					for (map in maps) {
						if (arrMaps.includes(maps[map].game)) {
							var scores = maps[map].score.split("-");
							var scoreHome = scores[1];
							var scoreAway = scores[0];
							if (team === maps[map].away.id || team === maps[map].home.id) {
								idGame.push(maps[map].game);
							}
							if (team == maps[map].away.id) {
								if (scoreAway > scoreHome) {
									maxAway = maxAway + 1;
								}
								else if (scoreAway < scoreHome) {
									maxHome = maxHome + 1;
								}
							}
							else if (team == maps[map].home.id) {
								if (scoreAway < scoreHome) {
									maxAway = maxAway + 1;
								}
								else if (scoreAway > scoreHome) {
									maxHome = maxHome + 1;
								}
							}
							if (maps[map].away.roster.includes(player)) {
								var nbGame = nbGame + 1;
								if (scoreAway > scoreHome) {
									var victory = victory + 1;
								}
								else if (scoreHome > scoreAway) {
									var defeat = defeat + 1;
								}
								else if (scoreHome === scoreAway) {
									var draw = draw + 1;
								}
							}
							else if (maps[map].home.roster.includes(player)) {
								var nbGame = nbGame + 1;
								if (scoreHome > scoreAway) {
									var victory = victory + 1;
								}
								else if (scoreAway > scoreHome) {
									var defeat = defeat + 1;
								}
								else if (scoreHome === scoreAway) {
									var draw = draw + 1;
								}

							}
						}



					}
					var unique = idGame.filter(onlyUnique);

					console.log(player + " - " + team + " | W " + victory + " | L" + defeat + " | D " + draw
						+ " | MAX " + nbGame + " | MAXAWAY " + maxAway + " | MAXHOME " + maxHome + " | IDGAME " + unique

					);

				}
			}
		})






		res.render('pages/result', {
			'roster': UserDB.roster
		})
	})


	/* !!!! ROUTE USER !!!! */
	app.get('/roster', function (req, res, next) {
		if (req.session.user !== undefined) {
			var user = req.session.user.pseudo
			var db = firebase.database();
			var firebasePlayers = db.ref("users/" + user);
			var UserDB = "";
			firebasePlayers.on("value", function (snapshot) {
				UserDB = snapshot.val();
			}, function (errorObject) {
				UserDB = null;
				console.log("The read failed: " + errorObject.code);
			});


			if (UserDB.roster !== undefined) {
				res.render('pages/roster', {
					'roster': UserDB.roster
				})
			}
			else {
				res.render('pages/roster', {
					'roster': "Selection des joueurs"
				})
			}

		}
		else {
			res.redirect('/login');
		}

	});
	app.post('/roster', function (req, res, naxt) {
		if (req.session.user !== undefined) {

			var roster = req.body.roster;
			var step = req.body.step;
			var arrPlayers = {};

			roster.forEach(player => {
				var playerStat = {};
				var playerClass = new Player(player);
				var stat = playerClass.Match();
				playerStat[playerClass.pseudo] = {
					"team": playerClass.idTeam,
					"gain": stat.wl.gain,
					"prix": stat.wl.prix
				}

				Object.assign(arrPlayers, playerStat);

				//players.push(playerStat);

			})
			var user = req.session.user.pseudo;
			var date = new Date();
			arrPlayers["update"] = date.toString();
			arrPlayers["step"] = step;
			arrPlayers["status"] = 0;
			console.log(arrPlayers)
			firebase.database().ref('/users/' + user + '/roster').set(arrPlayers);
			res.redirect('/roster');
		}
		else {
			res.redirect('/login');
		}
	})


	/* !!!! ROUTE ADMIN !!!! */
	app.get('/players/addDB', function (req, res, next) {
		var playerJSON = require('./JSON/ListPlayers.json');
		firebase.database().ref('/players').set(playerJSON);
		res.send('Update Players in DB')
	});
	app.get('/step/addDB', function (req, res, next) {
		var stepJSON = require('./JSON/Step.json');

		firebase.database().ref('/steps/' + stepJSON.step + '-' + stepJSON.week).set(stepJSON);
		res.send('Update Step in DB')
	});
	app.get('/maps/addDB', function (req, res, next) {
		var fs = require('fs');
		var files = fs.readdirSync('./JSON/matchs/');
		for (var i = 0; i < files.length; i++) {
			var mapJSON = require('./JSON/matchs/' + files[i]);
			var name = files[i].split(".").shift()
			firebase.database().ref('/maps/' + name).set(mapJSON);
		}
		res.send('Update Maps in DB')
	});


	/* !!!! ROUTE LOGIN/REGISTER !!!! */
	app.get('/register', function (req, res, next) {
		res.render('pages/register');
	});
	app.post('/register', function (req, res, next) {
		var form = {
			'pseudo': req.body.loginRegister,
			'email': req.body.emailRegister,
			'mdp': req.body.mdpRegister,
			'mdp2': req.body.mdp2Register
		};
		req.session.form = form;
		var hashedPassword = passwordHash.generate(req.body.mdpRegister);
		if (req.body.loginRegister === "") {
			req.flash('error', 'Le login peu pas etre vide');
			res.redirect('/register');
		}
		else if (req.body.emailRegister === "") {
			req.flash('error', 'L email peu pas etre vide');
			res.redirect('/register');
		}
		else if (req.body.mdpRegister === "" || req.body.mdp2Register === "") {
			req.flash('error', 'Le Mot de passe  peu pas etre vide');
			res.redirect('/register');
		}
		else if (req.body.mdpRegister != req.body.mdp2Register) {
			req.flash('error', 'Les deux mot de passe ne corresponde pas');
			res.redirect('/register');
		}

		else if (!regexEmail.test(req.body.emailRegister)) {
			req.flash('error', 'Un vrai mail sil te plait');
			res.redirect('/register');
		}
		else {
			var test = db.ref("users/");
			test.once("value").then(function (snapshot) {
				var resultDB = snapshot.child(req.body.loginRegister).hasChildren();
				if (resultDB === true) {
					req.flash('error', 'Nom d utilisateur déja pris');
					res.redirect('/register');
				} else {
					var user = {
						'pseudo': req.body.loginRegister,
						'email': req.body.emailRegister,
						'mdp': hashedPassword,
						'gold': 1000
					}
					firebase.database().ref('/users/' + req.body.loginRegister).set(user);
					req.session.login = true;
					req.session.user = user;
					res.redirect('/');
				}
			});
		}
	});
	app.get('/login', function (req, res, next) {
		res.render('pages/login');
	});
	app.post('/login', function (req, res, next) {
		var form = {
			'pseudo': req.body.login,
			'mdp': req.body.mdp
		};
		req.session.form = form;
		var test = db.ref("users/");
		test.once("value")
			.then(function (snapshot) {
				var resultDB = snapshot.child(req.body.login).hasChildren();
				var userDB = snapshot.child(req.body.login).val();
				if (resultDB === false) {
					req.flash('error', 'Email incorecte');
					res.redirect('/login');
				}
				else {
					if (passwordHash.verify(req.body.mdp, userDB.mdp)) {
						var user = {
							'pseudo': userDB.pseudo,
							'email': userDB.email,
							'mdp': userDB.mdp,
							'gold': userDB.gold
						}
						req.session.login = true;
						req.session.user = user;
						res.redirect('/');
					}
					else {
						req.flash('error', 'MDP incorrecte');
						res.redirect('/login');
					}
				}
			})
	});
	app.get('/logout', function (req, res, next) {
		delete req.session.login;
		delete req.session.user;
		res.redirect('/');
	});



};