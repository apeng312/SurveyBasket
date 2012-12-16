//var path = require('path');
//var mongoose = require('mongoose');
var passport = require('passport');
//var LocalStrategy = require('passport-local').Strategy;
var User = require('./User');

/*function configureExpress(app){
    app.configure(function(){
        app.use(express.bodyParser());
        app.use(express.methodOverride());

        app.use(express.cookieParser('your secret here'));
        app.use(express.session());

        app.use(passport.initialize());
        app.use(passport.session());

        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));
    });
}

function initPassportUser(){
    passport.use(new LocalStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
}
*/
function loginRoutes(app) {
	 app.get('/', function (req, res) {
        if (req.user === undefined){
            res.sendfile("html/Login.html");//'html/unregistered.html');
        }
        //else if (req.user.superuser){
        //    res.sendfile('html/root.html');
        //}
        else {
            res.sendfile('html/mainPage.html');
        }
    });

    console.log("about to do /register");
	app.post('/register', function(req, res) {
        console.log("in the register!!!!!!!!!!!!!!!!!!!!!!!!");
		var username = req.body.username;
		
		if ((req.body.username === "") || (req.body.password === "")) {
            console.log("checking empty");
			res.send("empty fields");
		} else if (req.body.username.search(/[^-\w]/) !== -1) {
            console.log("checking username");
			res.send("illegal characters");
		} else if (req.body.password.length < 6) {
            console.log("checking password");
			res.send("password too short");
		} else {
            console.log("before callBack now");
			User.findOne({username : username }, function(err, existingUser) {
                console.log("callBack now");
				if (err){
					return res.send({'err': err});
				}
				if (existingUser) {
					return res.send('user exists');
				}
                console.log("craeting user now");	
				var user = new User({
					username: req.body.username,
					credits: 200,
					surveys: [],
					completedSurveys: []
				});
				//user.registeredTimestamp = new Date();
                console.log("set password now");	
				user.setPassword(req.body.password, function(err) {
					if (err) {
						return res.send({'err': err});
					}
	
					user.save(function(err) {
						if (err) {
							return res.send({'err': err});
						}
                        console.log("about to send sucess");
						return res.send('success');
					});
				});  
			});
		}
	});


	app.post('/login', passport.authenticate('local'), function(req, res) {
		req.user.lastUserAgent = req.headers['user-agent'];
		req.user.lastIp = req.ip;
		req.user.lastHost = req.host;
		req.user.lastLoginTimestamp = new Date();
		req.user.save();
		return res.send('success');
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
}

module.exports = function(app) {
	//configureExpress(app);
	//initPassportUser();
	loginRoutes(app);
};
