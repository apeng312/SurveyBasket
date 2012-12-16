function getUserInfo() {
	$.ajax({
		url: "http://" + window.location.host + "/usr",
		type: "GET",
		success: function(data) {
			$(".credits").html(data.credits);
			$(".username").html(data.username+"'s");
		}
	});
}

$(document).ready(getUserInfo);
$(window).on("hashchange", getUserInfo);
$('body').on('touchstart.dropdown', function (e) { e.stopPropagation(); });
$(".dropdown .dropdown-toggle").click(function () {
	if ($(".nav.dropdown-menu-mod").css("display") === "none") {
		$(".nav.dropdown-menu-mod").css("display", "block");
	} else if ($(".nav.dropdown-menu-mod").css("display") === "block") {
		$(".nav.dropdown-menu-mod").css("display", "none");
	}
});
$("ul.dropdown-menu-mod li").on("mousedown", function() {
	$(this).addClass("active");
});
$("ul.dropdown-menu-mod li").on("mouseup", function() {
	$(this).removeClass("active");
	$(".dropdown .dropdown-toggle").trigger("click");
});