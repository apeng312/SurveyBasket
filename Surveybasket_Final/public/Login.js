function init() {
	//defines displays for each route in url
	clearErr();
	if ($("#heading").hasClass("fixed-head") || $("body").hasClass("more-top")) {
		$("#heading").removeClass("fixed-head");
		$("body").removeClass("more-top");
	}
	if (window.location.hash === "#/register") {
		loadLoginForm();
		loadRegister();
	} else if (window.location.hash === "#/login") {
		loadLoginForm();
		loadLogin();
	} else if (window.location.hash === "#/aboutus") {
		loadAboutUs();
	}
}

function loadRegister() {
	//creates register button and confirm password field and removes login button
	var login = $("#loginbutton");
	var register = $("#registerbutton");
	var confirmpass = $("#cpass");
	
	if (login.hasClass("visiobj")) {
		login.addClass("hiddenobj").removeClass("visiobj");
	}
	if (register.hasClass("hiddenobj")) {
		register.addClass("visiobj").removeClass("hiddenobj");
	}
	if (confirmpass.hasClass("hiddenobj")) {
		confirmpass.addClass("visiobj").removeClass("hiddenobj");
	}
}

function loadLogin() {
	//creates login button and removes register button and confirm password field
	var login = $("#loginbutton");
	var register = $("#registerbutton");
	var confirmpass = $("#cpass");
	
	if (register.hasClass("visiobj")) {
		register.addClass("hiddenobj").removeClass("visiobj");
	}
	if (login.hasClass("hiddenobj")) {
		login.addClass("visiobj").removeClass("hiddenobj");
	}
	if (confirmpass.hasClass("visiobj")) {
		confirmpass.addClass("hiddenobj").removeClass("visiobj");
	}
}

function loadAboutUs() {
	//puts information about survey basket onto page removes form
	var form = $("form[name=\"loginform\"]");
	var aboutus = $("#aboutus");
	if (form.hasClass("visiobj")) {
		form.addClass("hiddenobj").removeClass("visiobj");
	}
	if (aboutus.hasClass("hiddenobj")) {
		aboutus.addClass("visiobj").removeClass("hiddenobj");
	}
	if (!$("#heading").hasClass("fixed-head") || !$("body").hasClass("more-top")) {
		$("#heading").addClass("fixed-head");
		$("body").addClass("more-top");
	}
}

function loadLoginForm() {
	//puts login form onto page removes text about survey basket
	var form = $("form[name=\"loginform\"]");
	var aboutus = $("#aboutus");
	if (aboutus.hasClass("visiobj")) {
		aboutus.addClass("hiddenobj").removeClass("visiobj");
	}
	if (form.hasClass("hiddenobj")) {
		form.addClass("visiobj").removeClass("hiddenobj");
	}
}

function register()	{
	//checks for errors in form inputs and sends ajax
	var threwError = false;
	clearErr();
	if (($("#username").val() === "") || ($("#password").val() === "") || ($("#confirmpassword").val() === "")) {
		loadErr("empty fields");
		threwError = true;
	}
	if ($("#username").val().search(/[^-\w]/) !== -1) {
		loadErr("illegal characters");
		threwError = true;
	}
	if ($("#password").val().length < 6) {
		loadErr("password too short");
		threwError = true;
	}
	if ($("#password").val() !== $("#confirmpassword").val()) {
		loadErr("passwords do not match");
		threwError = true;
	}
	if (!threwError) {
		var data = new FormData();
		data.append("username", $("#username").val());
		data.append("password", $("#password").val());
		$.ajax({
			url: "http://" + window.location.host + "/register",
			data: data,
			cache: false,
			contentType: false,
			processData: false,	
			type: "POST",
			success: function(data) {
				if (data === "success") {
					//goes to login page if registration was successful and adds "registration successful" text
					window.location.hash = "#/login";
					$("#registerSuccess").addClass("visiobj").removeClass("hiddenobj")
				} else {
					loadErr(data);
				}
			},
			error: function(xhr, status, err) {
				clearErr();
				loadErr(err);
			}
		});
	}
	return false;
}

function loadErr(msgcode) {
	//loads errors and success texts under form
	switch (msgcode) {
		case ("user exists"): {
			$("#registerErr").addClass("visiobj").removeClass("hiddenobj");
			break;
		}
		case ("Unauthorized"): {
			$("#loginErr").addClass("visiobj").removeClass("hiddenobj");
			break;
		}
		case ("empty fields"): {
			$("#notfilledErr").addClass("visiobj").removeClass("hiddenobj");
			break;
		}
		case ("illegal characters"): {
			$("#illegalInputErr").addClass("visiobj").removeClass("hiddenobj");
			break;
		}
		case ("password too short"): {
			$("#shortPassErr").addClass("visiobj").removeClass("hiddenobj");
			break;
		}
		case ("passwords do not match"): {
			$("#passConfirmErr").addClass("visiobj").removeClass("hiddenobj");
			break;
		}
		default: {
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

function login() {
	//logs in user
	var data = new FormData();
	data.append("username", $("#username").val());
	data.append("password", $("#password").val());
	clearErr();
	if (($("#username").val() === "") || ($("#password").val() === "")) {
		loadErr("empty fields");
	} else {
		$.ajax({
			url: "/login",
			data: data,
			cache: false,
			contentType: false,
			processData: false,	
			type: "POST",
			success: function(data) {
				if (data === "success") {
					clearErr();
					window.location = "/";
				} else {
					loadErr(data);
				}
			},
			error: function(xhr, status, err) {
				loadErr(err);;
			}
		});
	}
	return false;
}

$(window).on("hashchange", init);
$(document).ready(init);