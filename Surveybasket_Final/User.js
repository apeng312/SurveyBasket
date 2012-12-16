var mongoose = require("mongoose");
var passLocMongoose = require("passport-local-mongoose");

var User = new mongoose.Schema({
	lastUserAgent: String,
	lastIp: String,
	lastHost: String,
	lastLoginTimestamp: Date,
	credits: Number,
	surveys: [String],
	completedSurveys: [String]
});

User.plugin(passLocMongoose);

module.exports = mongoose.model('User', User);
