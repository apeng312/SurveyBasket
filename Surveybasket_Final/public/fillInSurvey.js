window.onload = function() {
    console.log(window.location.hash);
    var survey_id = window.location.hash.slice(1);
	
	var req = $.ajax({
		type:"GET",
		url: "/usr",
		success: function(data) {
			if (data.completedSurveys.indexOf(survey_id) !== -1) {
				$("form > div").addClass("taken");
				$("form button").addClass("hidden");
			} else if (data.surveys.indexOf(survey_id) !== -1) {
				$("form > div").addClass("owned");
				$("form button").addClass("hidden");
			}
			requestSurvey(survey_id);
		}
	});
}

function requestSurvey(survey_id) {
	var req = $.ajax({
        type: "GET",
        url: "/survey/" + survey_id
    });

    req.done(function(receivedSurvey){
        questions = receivedSurvey.questions;
        var compiled_template = _.template($("#question-template").html());
        for (var i=0; i < questions.length; i++) {
            console.log(questions[i]);
            var data = {
                "index": (i+1) + ". ",
                "content": questions[i].content,
                "name": "question" + i,
                "type": questions[i].type,
                "id": i,
                "choices": questions[i].choices,
				"required": questions[i].required
            };
            $("#survey-list").append(compiled_template(data));
        }
		var compiled_template_surveyhead = _.template($("#survey-head").html());
		var data2 = {
			name: receivedSurvey.name,
			description: receivedSurvey.description,
			category: receivedSurvey.category
		};
		$("#surveyhead").html(compiled_template_surveyhead(data2));
    });
    req.fail(function(jqXHR, status, err) {
        alert(err);
    });

    $("#submit").click(function() {
        var responses = new Array();
        var response_string = $("form").serialize();
        var response_list = response_string.split("&");
        console.log("response_list");
        console.log(response_list);
        var next = 0;
        /* Need to carefully collect answers because
        there can be optional ones that users haven't
        filled in */
        for (var i=0; i < questions.length; i++) {
            console.log("response_string");
            console.log(response_string);
            var index = response_string.indexOf("answer" + i);
            if (index === -1) {
                if (questions[i].required === true) {
                    $("#err").html("You must fill in question " + (i+1));
                    return;
                }
                else {
                    responses.push(undefined);
                }
            }
            else {
                var answer = decodeURIComponent(response_list[next].split("=")[1]).replace(/\+/g, " ");
                if (answer === "" && questions[i].required === true) {
                    $("#err").html("You must fill in question " + (i+1));
                    return;
                }
                else {
                    responses.push(answer);
                    next++;
                }
            }
        }
        console.log(responses);
        var survey_id = window.location.hash.slice(1);
        console.log(survey_id);
        var survey_url = "http://" + window.location.host + "/survey/" + survey_id;
        console.log(survey_url);
        $.ajax({
            type: "PUT",
            url: survey_url,
            data: {
                "responses": responses
            },
            success: function(req){
                if (req.search("response saved") !== -1) {
					getUserInfo();
					$(".hidden").removeClass("hidden");
					$("form").addClass("hidden");
				};
            },
            error: function() {
                alert("Sorry some internal error occurred");
            }
        });
    });
}
