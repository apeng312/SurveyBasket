var path = require('path');
var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var express = require('express');
var passport = require("passport");
var http = require("http");
var User = require("./User");

var app = express();

function configureExpress(app){
    app.configure(function(){
        app.use(express.bodyParser());
        app.use(express.methodOverride());

        app.use(express.cookieParser('your secret here'));
        app.use(express.session());

        app.use(passport.initialize());
        app.use(passport.session());

        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));
		console.log(path.join(__dirname,'public'))
    });
}

function initPassportUser(){
    passport.use(new LocalStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
}

function init(app){
    var uristring = process.env.MONGODB_URI ||
                    process.env.MONGOLAB_URI ||
                    "mongod://localhost/db";
    var mongoOptions = {db: {safe: true}};

    //Connect
	mongoose.connect(uristring, mongoOptions, function (err, res) {
      if (err) { 
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
      } else {
        console.log ('Succeeded connected to: ' + uristring);
      }
});
	configureExpress(app);
	initPassportUser();
	require("./LoginRoutes")(app);
	require("./Survey")(app);
    var port = process.env.PORT || 3000;
	app.listen(port);
}

init(app);
