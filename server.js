var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var session = require('express-session')
var flash = require('express-flash');

var app = express();

let sessionOptions = {
	secret: "secretkey",
	cookie: {
		maxAge: 269999999999
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
app.use(function (req, res, next) {
	res.locals.user = req.session.user;
	res.locals.login = req.session.login;
	res.locals.form = req.session.form;
	next();
})
require('./routes.js')(app);

app.listen(8085)