window.onload = function() {
    
    var req = $.ajax({
        type: "GET",
        url: "/mySurveys"
    });
    req.done(function(receivedSurveys) {
        var complied_survey_template = _.template($("#survey-template").html());
        console.log(receivedSurveys);
        $("#survey-list").html("");
        for (var i = 0; i < receivedSurveys.length; i++)
        {
            var receivedSurvey = receivedSurveys[i];
            receivedSurvey.date = (new Date(receivedSurvey.date)).toDateString();
            var host = "http://" + window.location.host;
            var link = host + "/page/fillInSurvey.html#" + receivedSurvey._id;
            console.log(link);
            receivedSurvey.link = link;
            var survey_html = complied_survey_template(receivedSurvey);
            $("#survey-list").append(survey_html);
        }
    });
    req.fail(function(jqXHR, status, err) {
        alert(err);
    });
    
    $(window).on("hashchange", function(e) {
        console.log(window.location.hash);
        if (window.location.hash === "#sortByTime") {
            sortBy("getSurveys/date/10");
        }
        if (window.location.hash === "#sortByPopularity") {
            console.log("sort");
            sortBy("getSurveys/popularity/10");
        }
    });
}
