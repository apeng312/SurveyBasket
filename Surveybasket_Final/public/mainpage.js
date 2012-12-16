window.onload = function() {
    /* To indicate how many times the user clicks "next pgae" button */
    var index = 0;
    $("#prev-page").hide();

    $('body').on('touchstart.dropdown', '.dropdown-menu', function (e) { e.stopPropagation(); });
    function sortBy(user_url) {
        var req = $.ajax({
            type: "GET",
            url: user_url 
        });
        req.done(function(receivedSurveysBody) {
            var receivedSurveys = receivedSurveysBody.surveys;
            var end = receivedSurveysBody.end;
            var compiled_survey_template = _.template($("#survey-template").html());
            console.log(receivedSurveys);
            $("#survey-list").html("");
            if (end) {
                $("#next-page").hide();
            }
            for (var i = 0; i < receivedSurveys.length; i++)
            {
                var receivedSurvey = receivedSurveys[i];
                receivedSurvey.date = (new Date(receivedSurvey.date)).toDateString();
                var survey_html = compiled_survey_template(receivedSurvey);
                $("#survey-list").append(survey_html);
            }
        });

    req.fail(function(jqXHR, status, err) {
        alert(err);
    });
    }
    sortBy("/getSurveys/-date/0");
    
    $(window).on("hashchange", function(e) {
        if (window.location.hash === "#sortByTime") {
            sortBy("/getSurveys/-date/0");
        } else if (window.location.hash === "#sortByPopularity") {
            console.log("sort");
            sortBy("/getSurveys/-popularity/0");
            //sortBy("getSurveys/date/10");
		}
    });

    $(".legend").click(
        function() {
            var category = $(this).text();
            sortBy("/getSurveys/category/" + category);
        }
    )

    $("#next-page").click(function() {
        index += 10;
        $("#prev-page").show();
        if (window.location.hash === "#sortByTime" ||
            window.location.hash === "") {
            var sortfield = "-date";
        }
        else if (window.location.hash === "#sortByPopularity") {
            var sortfield = "-popularity";
        }
        console.log("in click!!!!!!!!!!!!!!!!!!!!!");
        console.log("getSurveys/" + sortfield + "/" + index);
        var req = $.ajax({
            type: "GET",
            url: "getSurveys/" + sortfield + "/" + index
        });
        req.done(function(receivedSurveysBody) {
            var receivedSurveys = receivedSurveysBody.surveys;
            var end = receivedSurveysBody.end;
            var compiled_survey_template = _.template($("#survey-template").html());
            console.log(receivedSurveys);
            $("#survey-list").html("");
            if (end) {
                $("#next-page").hide();
            }
            for (var i = 0; i < receivedSurveys.length; i++)
            {
                var receivedSurvey = receivedSurveys[i];
                receivedSurvey.date = (new Date(receivedSurvey.date)).toDateString();
                var survey_html = compiled_survey_template(receivedSurvey);
                $("#survey-list").append(survey_html);
            }
        }); 
    }
    );

    $("#prev-page").click(function() {
        index -= 10;
        if (index === 0) {
            $("#prev-page").hide();
        }
        $("#next-page").show();
        if (window.location.hash === "#sortByTime" ||
            window.location.hash === "") {
            var sortfield = "-date";
        }
        else if (window.location.hash === "#sortByPopularity") {
            var sortfield = "-popularity";
        }
        var req = $.ajax({
            type: "GET",
            url: "getSurveys/" + sortfield + "/" + index
        });
        req.done(function(receivedSurveysBody) {
            var receivedSurveys = receivedSurveysBody.surveys;
            var end = receivedSurveysBody.end;
            var compiled_survey_template = _.template($("#survey-template").html());
            console.log(receivedSurveys);
            $("#survey-list").html("");
            if (end) {
                $("#next-page").hide();
            }
            for (var i = 0; i < receivedSurveys.length; i++)
            {
                var receivedSurvey = receivedSurveys[i];
                receivedSurvey.date = (new Date(receivedSurvey.date)).toDateString();
                var survey_html = compiled_survey_template(receivedSurvey);
                $("#survey-list").append(survey_html);
            }
        }); 
    }
    );
}
