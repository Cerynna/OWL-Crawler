var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var session = require('express-session')
var flash = require('express-flash');
var Player = require('./object/Player.js');


var passwordHash = require('password-hash');
var firebase = require("firebase-admin");
var serviceAccount = require("./JSON/firebase.json");

const asyncHandler = require('express-async-handler');

firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount),
	databaseURL: "https://master-hook.firebaseio.com"
});






var app = express();

let sessionOptions = {
	secret: "secretkey",
	cookie: {
		maxAge: 365 * 24 * 60 * 60 * 1000
	},
	saveUninitialized: true,
	resave: true
};

if (app.get('env') === 'production') {
	app.set('trust proxy', 1);
	sessionOptions.cookie.secure = true;
}
else {
	sessionOptions.cookie.secure = false;
}

app.use(session(sessionOptions));

app.set('view engine', 'ejs');


app.use(express.static('public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(flash());

app.use(async (req, res, next) => {

	var db = await firebase.database();

	var firebasePlayers = await db.ref("players");
	var PlayersDB = [];
	await firebasePlayers.on("value", function (snapshot) {
		PlayersDB.push(snapshot.val());
	}, function (errorObject) {
		console.log("The read failed: " + errorObject.code);
	});


	var firebaseSteps = await db.ref("steps");
	var stepsDB = [];
	await firebaseSteps.on("value", function (snapshot) {
		stepsDB.push(snapshot.val());
	}, function (errorObject) {
		console.log("The read failed: " + errorObject.code);
	});
	var dateNow = Date.parse(new Date().toString()) / 1000;
	var Steps = {};
	stepsDB.forEach(steps => {
		for (step in steps) {
			var end = Date.parse(steps[step].end) / 1000;
			var start = Date.parse(steps[step].start) / 1000;

			if (start <= dateNow && end <= dateNow) {
				Steps = {
					'step': step.split('-')[0],
					'week': step.split('-')[1],
					'start': start,
					'end': end,
					'info': steps[step]
				}

			}

		}

	})
	var players = [];
	for (player in PlayersDB[0]) {
		var playerClass = new Player(player);
		players.push(playerClass);
	}
	req.session.step = Steps;
	res.locals.step = await Steps;
	res.locals.players = await players;
	res.locals.user = req.session.user;
	res.locals.login = req.session.login;
	res.locals.form = req.session.form;




	await next();
})




require('./routes.js')(app);

app.listen(8085)