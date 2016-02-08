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

	previewQuestion(req, res) {
		var question = req.body.question;
		var questionId = req.params.questionid;
		QuestionHelper.updateData(questionId, question)
			.then(function(lalal) {
				var answer = question.answer;
				var variableText = question.variables;
				var output = Answer.validateAnswer(answer, variableText);
				question.answer = output.answer;
				question.variables = {
					text:  variableText,
					variables: output.variables
				}
				if(output.ok) {
					question.answer.code = question.answer.generateCode();
					return QuestionHelper.writeQuestionFile(question);
				} else {
					res.status(200).jsonp({ok: false, message: "No se puede previsualizar en este momento ya que existen errores en la validación"});
				}
			})
			.then(function(question) {
				res.status(200).jsonp({ok: true, url: Config.apiUrl + "/static/" + questionId + "/launch.html"})
			})
			.catch(function(error) {
				console.error(error);

				res.status(400).json({
					ok: false
				})
			})
	},
	exportQuestion(req, res) {
		var question = req.body.question;
		var questionId = req.params.questionid;
		var originFolderRoute = "../questions/" + questionId;
		var copyFolderRoute = "../questions/" + questionId + "-scorm";
		var zipRoute = "../questions/" + questionId + ".zip";
		var scormQuestionDataRoute = copyFolderRoute + "/js/xml-question.js";
		var routeManifest = copyFolderRoute + "/imsmanifest.xml";

		QuestionHelper.updateData(questionId, question)
			.then(function(a) {
				var answer = question.answer;
				var variableText = question.variables;
				var output = Answer.validateAnswer(answer, variableText);
				question.answer = output.answer;
				question.variables = {
					text:  variableText,
					variables: output.variables
				}
				if(output.ok) {
					question.answer.code = question.answer.generateCode();
					return QuestionHelper.writeQuestionFile(question);
				} else {
					res.status(200).jsonp({ok: false, message: "No se puede exportar en este momento ya que existen errores en la validación"});
				}

				//Copy question folder for updated her data before zip
			})
			.then(function(question) {
				helper.copyFolderQuestion(originFolderRoute, copyFolderRoute);
				var originalData = JSON.stringify(question);
				var modifiedData = helper.updateImagesUrls(originalData);
				var data = "var question = " + modifiedData + "; question = JSON.parse(question);window.question = window.question || question;";
				var metadata = question.metadata;
				fs.writeFile(scormQuestionDataRoute, data, function (err) {
					if (err) {
						return res.status(400).jsonp({ok: false});
					}

					helper.writeManifest(routeManifest, metadata, function(err){
						if (err) {
							return res.status(400).jsonp({ok: false});
						}

						helper.zipFile(copyFolderRoute, zipRoute, function (ok) {
							if (!ok) {
								return res.status(400).jsonp({ok: false, message: "Oops! Something went wrong!"});
							}

							//clean if folder exist
							helper.deleteFolder(copyFolderRoute);

							return res.status(200).jsonp({ok: true});
						});
					})
				});
			}).catch(function(error) {
				console.log(error.stack);
				res.status(400).jsonp({ok: false})
			});
	},
	exportQuestionDownload(req, res) {
		var questionId = req.params.questionid;
		var file = "../questions/" + questionId + ".zip";
		var mime = require('mime');

		res.setHeader('Content-disposition', 'attachment; filename=' + path.basename(file));
		res.setHeader('Content-type', mime.lookup(file));

		fs.createReadStream(file).pipe(res);
	},
saveQuestion(req, res) {
	var question = req.body.question;
	var questionId = req.params.questionid;
	const folderRoute = "../../questions/" + questionId + "/images";

	QuestionHelper.updateData(questionId, question)
		.then(function(ll) {
			helper.deleteUselessImages(folderRoute, question);
			res.status(200).json({ok:true});
		})
		.catch(function(error) {
			res.status(400).json({
				ok:false,
				message: err.message
			});
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