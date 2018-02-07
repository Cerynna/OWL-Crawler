let fs = require('fs');
var util = require('util');
var Player = require('./object/Player.js');
var Role = require('./JSON/Role.json');
var playerJSON = require('./JSON/ListPlayers.json');
var MapsJSON = require('./JSON/ListMaps.json');
var regexEmail = /^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/;
var passwordHash = require('password-hash');
var firebase = require("firebase-admin");

var serviceAccount = require("./JSON/firebase.json");

firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount),
	databaseURL: "https://master-hook.firebaseio.com"
});


var db = firebase.database();

var firebasePlayers = db.ref("players");
var PlayersDB = [];
firebasePlayers.on("value", function (snapshot) {
	PlayersDB.push(snapshot.val());
}, function (errorObject) {
	console.log("The read failed: " + errorObject.code);
});





module.exports = function (app) {

	app.get('/', (req, res, next) => {
		res.render('pages/index')
	})

	app.get('/players', function (req, res, next) {

		var players = [];
		for (player in PlayersDB[0]) {
			var playerClass = new Player(player);
			players.push(playerClass);

		}

		res.render('pages/players', {
			'players': players,
			'Role': Role
		})


	})
	app.get('/players/addDB', function (req, res, next) {

		firebase.database().ref('/players').set(playerJSON);
		res.send('Update Players in DB')

	});
	app.get('/maps/addDB', function (req, res, next) {


		ObjectMaps = {};
		MapsJSON.forEach(map => {
			var ObjectMap = {};

			var info = map.split("/");
			var name = info[5];
			var match = info[3];
			var mapJSON = require('./JSON/matchs/' + name + '.json');

			ObjectMap[name] = {
				'match': match,
				'info': mapJSON,
			};
			Object.assign(ObjectMaps, ObjectMap);
		});
		firebase.database().ref('/maps').set(ObjectMaps);

		console.log(ObjectMaps);

		res.send('Update Maps in DB')

	});

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
			test.once("value")
				.then(function (snapshot) {
					var resultDB = snapshot.child(req.body.emailRegister).hasChildren();
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
						firebase.database().ref('/users/' + req.body.emailRegister).set(user);
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
				console.log(userDB);
				if (resultDB === false) {
					req.flash('error', 'Email incorecte');
					res.redirect('/login');
				}
				else {
					if (passwordHash.verify(req.body.mdp, userDB.mdp)) {

						var user = {
							'pseudo': userDB.login,
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

		// you might like to do a database look-up or something more scalable here
		// if (req.body.login && req.body.login === 'hystérias' && req.body.mdp && req.body.mdp === '0478876681') {
		// 	req.session.login = true;
		// 	req.session.user = user;
		// 	res.redirect('/');
		// } else {
		// 	req.flash('error', 'Username and password are incorrect');
		// 	res.redirect('/login');
		// }

	});

	app.get('/logout', function (req, res, next) {
		delete req.session.login;
		delete req.session.user;
		res.redirect('/');
	});

};