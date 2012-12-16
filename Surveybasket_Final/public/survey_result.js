$().ready(function() {
    /* First get infomation including responses of the survey */
    var survey_id = window.location.hash.slice(1); 
    /* Make questions, responses, sorted_responses global so that
    ajax request only needs to send once and information can 
    be used to display in chart or table*/
    var questions;
    var responses;
    var questions_content;
    var sorted_responses;
    var req = $.ajax({
        type: "GET",
        url: "/survey/" + survey_id
    });

    req.done(function(receivedSurvey) {
        questions = receivedSurvey.questions;
        questions_content = convert(questions);
        responses = receivedSurvey.responses;
        /* We pass in questions.length just case the responses is 
        empty array. If the responses is indeed empty array
        we still build a 2-d array and each element is an empty array */
        sorted_responses = zip(responses, questions.length);
        console.log("sorted_responses are");
        console.log(sorted_responses);
        draw();
    });


    req.fail(function(jqXHR, status, err) {
        alert(err);
    });

    function draw() {
        for (var i=0; i < questions.length; i++) {
            var choices = questions[i].choices;
            var type = questions[i].type;
            /* Process the survey so that
            1. If it is multiple_choice, the result will be in the form of
            {option1: (number), option2: (number), option3: (number) } 
            2. If it is free_response, the result will be an array of
            strings 
            3. If there's no responses to this question at all, it will 
            be an empty array */
            var result = process(sorted_responses[i], choices, type);
            console.log(JSON.stringify(result));
            var compiled_template = _.template($("#response-template").html());
            var object = {
                "index": i+1 + ". ",
                "chartIndex": "chart" + i,
                "content": questions[i].content,
                "type": type,
                "typeIndex": "type" + i,
                "result": JSON.stringify(result),
                "resultIndex": "result" + i
            }
            $("#survey-list").append(compiled_template(object));
        }
        $(".click-to-show").click(function() {
            if ($(this).hasClass("down")) {
                $(this).children(".free-answer").slideDown("slow");
                $(this).removeClass("down");
            }
            else {
                $(this).children(".free-answer").slideUp("slow");
                $(this).addClass("down");
            }
        });

        drawChart();
    }

    function convert(questions) {
        var result = new Array();
        for (var i=0; i<questions.length; i++) {
            result.push(questions[i].content); 
        }
        return result;
    }

    function zip(arrays, number_of_questions) {
    /* Our "2d" array is an array of reponseSchema, and
    responseSchema.responses is an array */
        if (arrays.length === 0) {
            return create_2dArray(number_of_questions);
        }
        var row = arrays.length;
        var col = number_of_questions; 
        var result = new Array();
        for (var j = 0; j < col; j++) {
            result.push(new Array());
            for (var i = 0; i < row; i++) {
                result[j].push(arrays[i].responses[j]);
            }
        }  
        return result;
    }

    function process(res, choices, type) {
        if (res.length === 0) {
            return [];
        }
        else if (type === "free_response") {
            return res;
        }
        else {
            var result = {}; 
            for (var i=0; i < choices.length; i++) {
                var choice = choices[i];
                result[choice] = 0; 
            }
            for (i=0; i < responses.length; i++) {
                var response = res[i];
                if (result[response] !== undefined) {
                    result[response] += 1;
                }
            }
            return result;
        }
    }

    function create_2dArray(col) {
        var result = [];
        for (var i=0; i<col;i++) {
            result.push([]);
        }
        return result;
    }
    
    $("#table-button").click(function() {
        console.log("questions-content");
        console.log(questions_content);
        var table_template = _.template($("#table-template").html());
        $("#survey-list").html("");
        if (responses.length === 0) {
            $("#survey-list").html(
            "<div class='alert answer'>No responses received yet</div>"
            );
        }
        else {
            $("#survey-list").html(table_template(
            {"questions": questions_content,
             "responders": responses}));
         }
    });

    $("#chart-button").click(function() {
        $("#survey-list").html("");
        draw();
    });

})
