var mongoose = require("mongoose");

var QuestionSchema = new mongoose.Schema({
	type: String,
	content: String,
	choices: [String],
	required: Boolean
});

var ResponseSchema = new mongoose.Schema({
	responses: [String]
});

var SurveySchema = new mongoose.Schema({
	author: String,
	name: String,
	description: String,
	date: Date,
	category: String,
	questions: [QuestionSchema],
	responses: [ResponseSchema],
	editable: Boolean,
	popularity: Number
});

module.exports = {
	question: mongoose.model("Question", QuestionSchema),
	response: mongoose.model("Response", ResponseSchema),
	survey: mongoose.model("Survey", SurveySchema)
};
