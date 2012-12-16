var our_models = require("./MongooseModels");

/*
req.body =
{
	name: String,
	description: String,
	category: String,
	**we'll add date and author attributes on the server side**
	types: array[String],
	contents: array[String],
	choices: array[ array[String] ],
	required: array[Boolean]
}
*/


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
				console.log("____________________");
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
                        res.send(surveys);
                    }
                });

        }
        /* number here will be the id of the bottom showing
        on our main page */
        else {
			/*our_models.survey.findById(req.params.id,function(err, foundSurvey){*/
            if (req.params.number !== "0") {
                console.log("enter the first case");
                our_models.survey.findById(req.params.number, 
                                           function(err, indicator) {
                    if (err) {
                        res.send(err)
                    }
                    else {
                        console.log(req.params.sortfield);
                        console.log(indicator);
                        var indicatorValue = indicator[req.params.sortfield];      
                        console.log(indicatorValue);
                        search(indicatorValue, 10);
                    }
                });
            }
            else {
                our_models.survey
                .find()
                .sort("-"+ req.params.sortfield)
                .limit(10)
                .select("author name description date popularity category")
                .exec( function(err, foundSurveys) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        res.send(foundSurveys);
                    }
                }
                )
            }
            /* Here number is index (index of search result) */
           /* Start of search function */
            function search(indicatorValue, limitNumber) {our_models.survey
                .find()
                .sort("-" + req.params.sortfield)
                .where(req.params.sortfield).lte(indicatorValue)
                .limit(limitNumber)
                .select("author name description date popularity category")
                .exec(function(err, surveys) {
                    console.log("In search");
                    if (err) {
                        res.send(err);
                    } else {
                        var found = false;
                        /* This for loop is to find out whehter the indictor
                        (survey) is in the surveys and where it is */
                        for (var i=0; i < surveys.length; i++) {
                            if (surveys[i].id === req.params.number) {
                                found = true;
                                break;
                            }
                        }
                        if (surveys.length < limitNumber) {
                            if (found) {
                                res.send(surveys.slice(i));
                            }
                            else {
                                /* This should never happen */
                                res.send("ERROR");
                            }
                        }
                        else {
                            if (found) {
                                var rest = surveys.length - i - 1;
                                if (rest >= 10) {
                                    res.send(surveys.slice(i+1, i+10));
                                    return;
                                }
                                /* Not enough surveys to send back 
                                so we increament limitNumber and search
                                again */
                            }
                            search(indicatorValue, limitNumber+10);
                        }
                    }
                });
           }
           /* End of search function */
        }
	});
}

module.exports = surveyRoutes;
