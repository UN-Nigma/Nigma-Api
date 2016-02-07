var mongoose = require('mongoose');
var Question = mongoose.model('question');
var Folder = mongoose.model('folder');
var async = require('async');
var uniqid = require('uniqid');
var helper = require('../lib/helper.js');
var QuestionHelper = helper.question;
var Config = require("../config/config");
var fs = require('fs');
var path = require('path');
const VariableParser = require('../lib/variables/parser');
const Answer = require('../lib/answers/answer');



module.exports = {

	createQuestion(req, res) {
		var user = req.user;
		var parentFolderId = req.params.folderid;

		Question.createQuestion(req.body.question.name, user, parentFolderId, helper)
			.then(function(question) {
				res.status(200).json({
					ok: true,
					question: question
				});
			})
			.catch(function(error) {
				res.status(400).json({
					ok: false,
					message: error.message
				});
			})
	},

	getQuestion(req, res) {
		var user = req.user;
		var questionId = req.params.questionid;
		Question.getById(questionId).then(function(question) {
			question.answer = question.answer || new Answer();
			res.status(200).json({
				ok: true,
				question: question
			});
		}).catch(function(error) {
			res.status(400).json({
				ok: false,
				error: erorr.message
			});
		})
	},

updateQuestion(req, res) {
	var question = req.body.question;
	var questionId = req.params.questionid;

	Question.updateName(questionId, question.name, function (err, rows) {
		if (err) {
			return res.status(400).json({
				ok: false,
				message: err.message
			});
		}

		if (rows.n == 0) {
			return res.status(400).json({
				ok: false,
				message: "The question does not exist"
			});
		}

		res.status(200).json({
			ok: true
		});
	});
},

setData(req, res) {
	var question = req.body.question;
	var questionId = req.params.questionid;
	const folderRoute = "../../questions/" + questionId + "/images";

	QuestionHelper.updateData(questionId, question, function (err, rows) {
		if (err) {
			return res.status(400).json({
				ok:false,
				message: err.message
			});
		}

		helper.deleteUselessImages(folderRoute, question);

		res.status(200).json({ok:true});
	});
},

deleteQuestion(req, res) {
	var questionId = req.params.questionid;

	Question.deleteById(questionId, helper)
		.then(function(question) {
			res.status(200).json({
				ok: true
			});
		})
		.catch(function(error) {
			console.error(error);
			res.status(400).json({
				ok: false,
				message: error.message
			});
		});
},

validateVariables(req, res) {
	var variableText = req.body.variables.text;
	var questionId = req.params.questionid;
	var data = {variables: variableText};
	var output = VariableParser.validate(variableText);
	Question.updateFields(questionId, data).then(function(question) {
		res.status(200).json(output);
	}).catch(function(error) {
		res.status(400).json({
			ok: false,
			message: error.message
		});
	})
},

validateAnswer(req, res) {
	var answer = req.body.answer;
	var variableText = req.body.variables.text;
	var questionId = req.params.questionid;
	var output = Answer.validateAnswer(answer, variableText);
	var data = {}
	data["variables"] = variableText
	data["answer"] = answer
	Question.updateFields(questionId, data).then(function(question) {
		res.status(200).json(output);
	}).catch(function(error) {
		res.status(400).json({
			ok: false,
			message: error.message
		});
	})
}


};