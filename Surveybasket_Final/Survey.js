var our_models = require("./MongooseModels");

function surveyRoutes(app) {
	app.post("/survey", function(req, res) {
		var all_questions = [];
		var current_question;
		for (var i=0; i<req.body.types.length; i++) {
			if (req.body.required[i] === "true") {
				req.body.required[i] = true;
			} else if (req.body.required[i] === "false") {
				req.body.required[i] = false;
			} else {
				res.send("illegal input");
				return;
			}
			var data = {
				type: req.body.types[i],
				content: req.body.contents[i],
				required: req.body.required[i]
			}
			if (data.type === "multiple_choice") {
				data.choices = req.body.choices[i];
				console.log(data);
			}
			current_question = new our_models.question(data);
			all_questions.push(current_question);
		}
		var userSurvey = new our_models.survey({
			author: req.user.username,
			date: new Date(),
			category: req.body.category,
			name: req.body.name,
			description: req.body.description,
			questions: all_questions,
			popularity: 0
		});
		
		if (req.user.credits >= 50) {
			userSurvey.save(function(err){
				if (err) {
					console.log(err);
				}
			});

			req.user.surveys.push(userSurvey.id);
			req.user.credits -= 50;
			req.user.save();

			res.send(userSurvey.id);
		} else {
			res.send("not enough credits");
		}
	});
	
    app.get("/usr", function(req, res) {
        res.send({
            credits: req.user.credits,
            username: req.user.username,
			surveys: req.user.surveys,
			completedSurveys: req.user.completedSurveys
        });
    });

	app.get("/survey/:id", function (req, res) {
		var fields = (req.user.surveys.indexOf(req.params.id)===-1) ? "": "responses ";
		fields += "author name description questions category";
		console.log(req.user.surveys.indexOf(req.params.id)===-1);
		console.log(req.user.surveys);
		our_models.survey.findById(req.params.id, fields, function(err, foundSurvey){
    	   	console.log("callback");
        	console.log(foundSurvey);
			res.send(foundSurvey);
   		});
	});
	
	app.put("/survey/:id", function (req, res) {
		if (req.user!==undefined && req.user.surveys.indexOf(req.params.id)===-1 && req.user.completedSurveys.indexOf(req.params.id)===-1) {
			var received_response = new our_models.response({
				responses: req.body.responses
			});
			our_models.survey.findById(req.params.id,function(err, foundSurvey){
				console.log("callback");
				console.log(foundSurvey);
				foundSurvey.responses.push(received_response);
				foundSurvey.popularity++;
				foundSurvey.save(function(err) {
					if (err) {
						console.log(err);
					} else {
						req.user.credits += 25;
						req.user.completedSurveys.push(foundSurvey.id);
						req.user.save();
						res.send(req.user.username + " response saved");
					}
				});
			});
		} else {
			res.send([req.user.completedSurveys.indexOf(req.params.id), req.user.surveys.indexOf(req.params.id), "unauthorized"]);
		}
	});
	
	app.get("/mySurveys", function (req, res) {
		our_models.survey.find({author: req.user.username}, "name description category date", function(err, mySurveys) {
			if (err) {
				console.log(err);
			} else {
				res.send(mySurveys);
			}
		})
	});
	
	app.get("/page/:filename", function(req, res) {
		if (req.user === undefined) {
			res.redirect("/");
		} else {
			res.sendfile("html/" + req.params.filename);
		}
	});
	
	app.get("/getSurveys/:sortfield/:number", function(req, res) {
        if (req.params.sortfield === "category"){
            our_models.survey
                /* number is actually the category : < */
                .find({"category": req.params.number})
                .select("author name description date popularity category")
                .sort("-date")
                .exec(function(err, surveys) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send({surveys: surveys,
                                  end: false});
                    }
                });

        }
        /* number here will be the id of the bottom showing on our main page */
        else {
            console.log(req.params);
            our_models.survey
                .find()
                .sort(req.params.sortfield)
                .select("author name description date popularity category")
                .exec(function(err, surveys) {
                    if(err) {
                        console.log(err);
                    } else {
                        var index = parseInt(req.params.number);
                        console.log(index);
                        var surveys_to_send = surveys.slice(index, index+10);
                        console.log("survey_to_send.lengt");
                        console.log(surveys_to_send.length);
                        if (index+10 >= surveys.length) {
                            var reach_end = true;
                        }
                        else {
                            reach_end = false;
                        }
                        console.log(index);
                        res.send({
                            surveys: surveys_to_send,
                            end: reach_end
                        });
                    }
                }
                )
        }
	});
}

module.exports = surveyRoutes;
