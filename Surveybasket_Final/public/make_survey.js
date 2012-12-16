function validateForm0() {
	var form = document.forms["survey0"]
	if ((form["name"].value === "") || (form["description"].value === "") || (form["category"].value === "")) {
		clearErr();
		setErrMsg("empty fields");
		return false;
	}
	clearErr();
	return true;
}

function postSurvey(surveyObj) {
	$.ajax({
		type: "POST",
		url: "http://" + window.location.host + "/survey",
		data: surveyObj,
		success: function(res) {
			$(".surveylink").html("<a href=\"http://" + window.location.host + "/page/fillInSurvey.html#" + res + "\">http://" + window.location.host + "/page/fillInSurvey.html#" + res + "</a>");
			$(".breadcrumb a").contents().unwrap();
			if (res === "not enough credits") {
				$("#failure").removeClass("hiddenBox").addClass("visiBox");
			} else {
				$("#success").removeClass("hiddenBox").addClass("visiBox");
			}
			$("#previewbox").addClass("hiddenBox").removeClass("visiBox");
			getUserInfo();
		},
		error: function(err) {
			console.log(err);
		}
	});
}

function escapeHtml(input) {
	var entityMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': '&quot;',
		"'": '&#39;',
		"/": '&#x2F;'
	};
	if (typeof(input) === "string") {
		return input.replace(/[&<>"'\/]/g, function (s) {
			return entityMap[s];
		});
	} else if (input instanceof Array) {
		for (var i=0; i < input.length; i++) {
			input[i] = escapeHtml(input[i]);
		}
		return input;
	} else if (input instanceof Object) {
		for (prop in input) {
			input[prop] = escapeHtml(input[prop]);
		}
		return input
	} else {
		return input;
	}
}

function validateForm1(){
	var serialArray = ($("form[name=\"survey1\"]").serializeArray());
	var surveyObj = array2Object(serialArray);
	console.log(surveyObj);
	var fieldArray = ["types", "contents", "choices", "required"];
	for (var i=0; i < fieldArray.length; i++) {
		if (!(surveyObj[fieldArray[i]] instanceof Array) || surveyObj[fieldArray[i]].length < 1) {
			clearErr();
			setErrMsg("too few questions");
			return false;
		}
	}
	clearErr();
	return true;
}

function getURLparams() {
	var params = {};
	params.hash = window.location.hash.slice(2);
	var queryArray = window.location.search.slice(1).split("&")
	var queryJSON = {};
	//try {
		if (window.location.search.slice(1) !== "") {
			for (var i=0; i < queryArray.length; i++) {
				kvpair = queryArray[i].split("=");
				if (queryJSON[kvpair[0]] === undefined) {
					queryJSON[kvpair[0]] = decodeURIComponent(kvpair[1].replace(/\+/g, " "));
				} else if (queryJSON[kvpair[0]] instanceof Array) {
					queryJSON[kvpair[0]].push(decodeURIComponent(kvpair[1].replace(/\+/g, " ")));
				} else {
					queryJSON[kvpair[0]] = [queryJSON[kvpair[0]], decodeURIComponent(kvpair[1].replace(/\+/g, " "))];
				}
			}
		}
		params.vars = escapeHtml(queryJSON);
		return params;
	//} catch(err) {
		//console.log(err);
	//	return params;
	//}
}

function validateSurveyInfo(params) {
	if (params.hash === "surveyinfo") {
		if ((params.vars.types !== undefined) || (params.vars.contents !== undefined) || (params.vars.choices !== undefined)
			|| (params.vars.required !== undefined)) {
			var templateData = {
				types: params.vars.types,
				contents: params.vars.contents,
				choices: params.vars.choices,
				required: params.vars.required
			};
			if (params.vars.submitted !== undefined) {
				templateData.submitted = params.vars.submitted;
			}
			if (params.vars.submitted0 !== undefined) {
				templateData.submitted0 = params.vars.submitted0;
			}
			var compiledqprev = _.template($("#prev-formfill").html());
			html1 = compiledqprev(templateData);
			$("#futuresections").html(html1);
		} else if (typeof(window.localStorage) !== "undefined") {
			window.localStorage["SurveyBasket123456a"] = "started";
		}
	}
}

function validateConfirm(params) {
	if (params.hash === "confirm") {
		if ((params.vars.name === undefined) || (params.vars.description === undefined || params.vars.category === undefined)
			|| (params.vars.types === undefined) || (params.vars.contents === undefined) || (params.vars.choices === undefined)
			|| (params.vars.required === undefined)) {
			window.location.search = "?";
			window.location.hash = "#";
			return getURLparams;
		} else {
			var compiledsurveyinfo = _.template($("#preview").html());
			var html2 = compiledsurveyinfo(params.vars);
			$("#preview-head").html(html2);
			
			$("#qbox-prev2 > ol").html("");
			for (var i=0; i<params.vars.types.length; i++) {
				params.vars.choices[i] = escapeHtml(HTMLtoArray(params.vars.choices[i]));
				
				var compiledsurveyqs = _.template($("#question-template").html());
				var html3 = compiledsurveyqs({
					_id: "answer" + i,
					type: params.vars.types[i],
					content: params.vars.contents[i],
					choices: params.vars.choices[i],
					required: params.vars.required[i]
				});
				$("#qbox-prev2 > ol").append(html3);
			}
		}
	}
}

function validateSurveyQuestions(params) {
	if (params.hash === "surveyquestions") { 
		if ((params.vars.name === undefined) || (params.vars.description === undefined || params.vars.category === undefined)) {
			window.location.search = "?";
			window.location.hash = "#";
		} else {
			var templateData = {
				name: params.vars.name,
				description: params.vars.description,
				category: params.vars.category
			};
			if (params.vars.submitted !== undefined) {
				templateData.submitted = params.vars.submitted;
			}
			if (params.vars.submitted0 !== undefined) {
				templateData.submitted0 = params.vars.submitted0;
			}
			var compiledqprev = _.template($("#prev-formfill").html());
			var html1 = compiledqprev(templateData);
			$("#prev-form").html(html1);
			if ((params.vars.types !== undefined) || (params.vars.contents !== undefined) || (params.vars.choices !== undefined)
				|| (params.vars.required !== undefined)) {
				$("#qbox-prev > ol").html("");
				for (var i=0; i<params.vars.types.length; i++) {
					params.vars.choices[i] = escapeHtml(HTMLtoArray(params.vars.choices[i]));
					
					var compiledsurveyqs = _.template($("#question-template").html());
					var html3 = compiledsurveyqs({
						_id: "answer" + i,
						type: params.vars.types[i],
						content: params.vars.contents[i],
						choices: params.vars.choices[i],
						required: params.vars.required[i]
					});
					$("#qbox-prev > ol").append(html3);
				}
				$("li > .closebox").click(function() {
					$(this).parent().remove();
				});
			}
		}
	}
}

function HTMLtoArray(input) {
	var arraystring = unescapeHTML(input);
	return HTMLtoArray_helper(arraystring);
}

function HTMLtoArray_helper(arraystring) {
	if (typeof(arraystring) === "string") {
		try {
			return JSON.parse(arraystring);
		} catch(err) {
			return arraystring;
		}
	} else if (arraystring instanceof Array){
		for (var i=0; i < arraystring.length; i++) {
			arraystring[i] = HTMLtoArray_helper(arraystring[i]);
		}
		return arraystring
	} else if (arraystring instanceof Object) {
		for (prop in arraystring) {
			arraystring[prop] = HTMLtoArray_helper(arraystring[prop]);
		}
		return arraystring;
	} else {
		return arraystring;
	}
}

function unescapeHTML(input) {
	var entityMap = {
		"&amp;": "&",
		"&lt;": "<",
		"&gt;": ">",
		'&quot;': '"',
		'&#39;': "'",
		'&#x2F;': "/"
	};
	if (typeof(input) === "string") {
		return input.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;/g, function (s) {
			return entityMap[s];
		});
	} else if (input instanceof Array) {
		for (var i=0; i < input.length; i++) {
			input[i] = unescapeHTML(input[i]);
		}
		return input;
	} else if (input instanceof Object) {
		for (prop in input) {
			input[prop] = unescapeHTML(input[prop]);
		}
		return input
	} else {
		return input;
	}
}

function array2Object(queryArray) {
	var queryJSON = {};
	for (var i=0; i < queryArray.length; i++) {
		kvpair = queryArray[i];
		if (queryJSON[kvpair.name] === undefined) {
			queryJSON[kvpair.name] = decodeURIComponent(kvpair.value.replace(/\+/g, " "));
		} else if (queryJSON[kvpair.name] instanceof Array) {
			queryJSON[kvpair.name].push(kvpair.value);
		} else {
			queryJSON[kvpair.name] = [queryJSON[kvpair.name], kvpair.value];
		}
	}
	return escapeHtml(queryJSON);
}

function changePage() {
	var params = getURLparams();
	var page = $("#" + params.hash);
	$(".page-content").addClass("hiddenBox").removeClass("visiBox");
	if (page.length !== 0) {
		page.removeClass("hiddenBox").addClass("visiBox");
	} else {
		$("#surveyinfo").addClass("hiddenBox").removeClass("visiBox");
		window.location.hash = "#/surveyinfo";
	}
	if ((params.hash.saved === "true") || (params.vars.submitted0 !== undefined) || (params.vars.submitted !== undefined)) {
		if ((typeof(window.localStorage) !== "undefined") && (window.localStorage["SurveyBasket123456a"] === "started")) {
			var saveState = window.location.search;
			window.localStorage["SurveyBasket123456"] = saveState;
		} else if (window.localStorage["SurveyBasket123456a"] !== "started") {
			delete window.localStorage["SurveyBasket123456"];
		}
	}
	if (params.hash === "confirm") {
		$("#submitAll").click(function(){
			delete window.localStorage["SurveyBasket123456"];
			delete window.localStorage["SurveyBasket123456a"];
			console.log(params.vars);
			postSurvey(params.vars);
		});
	}
	validateSurveyInfo(params);
	validateSurveyQuestions(params);
	validateConfirm(params);
	var inputs;
	for (name in params.vars) {
		inputs = $(":input[name=\""+name+"\"]:not([type=\"hidden\"], .hiddenBox, .hiddenBox *)", "#surveyinfo");
		if (inputs.length > 0) {
			inputs.val(unescapeHTML(params.vars[name]));
		}
	}
	if (!((params.vars.name === undefined) || (params.vars.description === undefined || params.vars.category === undefined)
		|| (params.vars.submitted0 === undefined))) {
		var link2 = $(".breadcrumb > li:nth-child(2)", page);
		var activeDivider1 = $(".breadcrumb > li:nth-child(1) > .divider", page);
		if (link2.hasClass("hiddenBox")) {
			link2.removeClass("hiddenBox").addClass("visiBox");
		}
		if (activeDivider1.hasClass("hiddenBox")) {
			activeDivider1.removeClass("hiddenBox").addClass("visiBox");
		}
		if (!((params.vars.types === undefined) || (params.vars.contents === undefined) || (params.vars.choices === undefined)
			|| (params.vars.submitted === undefined))) {
			var link3 = $(".breadcrumb > li:nth-child(3)", page);
			var activeDivider2 = $(".breadcrumb > li:nth-child(2) > .divider", page);
			if (link3.hasClass("hiddenBox")) {
				link3.removeClass("hiddenBox").addClass("visiBox");
			}
			if (activeDivider2.hasClass("hiddenBox")) {
				activeDivider2.removeClass("hiddenBox").addClass("visiBox");
			}
		}
	}
}

function makeChoice() {
	var field = $("input[name=\"choice\"]");
	var choiceContent = escapeHtml(field.val());
	if (choiceContent !== "") {
		field.val("");
		var compiled = _.template($("#choices-template").html());
		var html = compiled({choicescontent: choiceContent});
		$("#questionChoices").append(html);
		var xdelete = $(".qcontainer > .closebox");
		$(xdelete[xdelete.length-1]).click(function() {
			$(this).parent().remove();
		});
		clearErr();
	} else {
		clearErr();
		setErrMsg("no text");
	}
}

function makeQuestion() {
	var inputs = $("input:not([type=\"hidden\"])", "#qbox-prev > ol > li");
	var textareas = $("#qbox-prev > ol > li > textarea");
	var questions = inputs.add(textareas);
	var make_form = $("form[name=\"survey1-prequestion\"]");
	var question = array2Object(make_form.serializeArray());
	if ((question.type === "") || (question.content === "")) {
		clearErr();
		setErrMsg("empty fields");
	} else if ((question.type === "multiple_choice") && !((question.choices instanceof Array) && (question.choices.length > 1))) {
		clearErr();
		setErrMsg("too few choices")
		console.log(question.choices);
	} else {
		var id, lastq;
		if (questions.length !== 0) {
			lastq = questions[questions.length-1];
			id = parseInt($(lastq).attr("name").slice("answer".length)) + 1;
		} else {
			id = 0;
		}
		question._id = id;
		if (!question.required) {
			question.required = undefined;
		}
		if (!question.choices) {
			question.choices = [];
		}
		var compiled = _.template($("#question-template").html());
		var html = compiled(question);
		$("#qbox-prev > ol").append(html);
		var xdelete = $("li > .closebox");
		$(xdelete[xdelete.length-1]).click(function() {
			$(this).parent().remove();
		});
		resetForm("form[name=\"survey1-prequestion\"]");
		$("#choicesformfield").addClass("hiddenBox").removeClass("visiBox");
		$("#questionChoices").html("");
		clearErr();
	}
}

function resetForm(form) {
    $(form).find(":input").each(function() {
        switch(this.type) {
            case "password":
            case "select-multiple":
            case "select-one":
            case "text":
            case "textarea":
                $(this).val("");
                break;
            case "checkbox":
            case "radio":
                this.checked = false;
        }
    });
	
}

function init() {
	changePage();
	$("select[name=\"type\"]").on("change", function() {
		if ($(this).val() === "multiple_choice" && $("#choicesformfield").hasClass("hiddenBox")) {
			$("#choicesformfield").removeClass("hiddenBox").addClass("visiBox");
		} else if ($(this).val() !== "multiple_choice" && $("#choicesformfield").hasClass("visiBox")) {
			$("#choicesformfield").addClass("hiddenBox").removeClass("visiBox");
			$("#questionChoices").html("");
		}
	});
}

$(document).ready(function() {
	if ((typeof(window.localStorage) !== "undefined") && (typeof(window.localStorage["SurveyBasket123456"]) !== "undefined")
		&& (window.location.search.length <= 1) && (window.localStorage["SurveyBasket123456a"] === "started")) {
		window.location.search = window.localStorage["SurveyBasket123456"];
	} else if (window.localStorage["SurveyBasket123456a"] !== "started") {
		delete window.localStorage["SurveyBasket123456"];
		window.location.search = "?";
		window.location.hash = "#";
	}
	init();
});

$(window).on("hashchange", init);

function setErrMsg(msgcode) {
	//loads errors and success texts under form
	switch (msgcode) {
		case ("too few choices"): {
			$(".choiceErr").addClass("visiobj").removeClass("hiddenobj");
			break;
		}
		case ("too few questions"): {
			$(".questionErr").addClass("visiobj").removeClass("hiddenobj");
			break;
		}
		case ("empty fields"): {
			$(".notfilledErr").addClass("visiobj").removeClass("hiddenobj");
			break;
		}
		case ("no text"): {
			$(".noTextErr").addClass("visiobj").removeClass("hiddenobj");
			break;
			// alerts unexpected errors (not one of the above)
			alert(JSON.stringify(msgcode));
			break;
		}
	}
}

function clearErr() {
	//removes messages about error and registration success
	var errormsg = $(".err");
	errormsg.each(function(index, element) {
		if ($(element).hasClass("visiobj")) {
			$(element).addClass("hiddenobj").removeClass("visiobj")
		}
	});
}