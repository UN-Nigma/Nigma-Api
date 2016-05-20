
var fs = require('fs');
var archiver = require('archiver');
var fsx = require('fs-extra');
var path = require('path');
var mongoose = require('mongoose');
var Question = mongoose.model('question');
var Config = require("../config/config");


module.exports = {

	zipFile: function (folderRoute, zipRoute, cb) {

		var output = fs.createWriteStream(zipRoute);
		var zipArchive = archiver('zip');

		output.on('close', function () {
			cb(true);
		});

		zipArchive.pipe(output);

		zipArchive.bulk([
			{src: ['**/*'], cwd: folderRoute, expand: true}
		]);

		zipArchive.finalize(function (err, bytes) {
			if (err) {
				throw err;
			}
		});
	},

	deleteFolder: function (route){
		fsx.removeSync(route);
	},



	copyScormTemplate: function (folderName) {
		fsx.copySync(path.resolve(__dirname, '../../scorm-template'), path.resolve(__dirname, '../../questions/' + folderName));
	},

	copyFolderQuestion: function (folderRoute, copyFolderRoute) {
		fsx.copySync(folderRoute, copyFolderRoute);
	},

	updateImagesUrls: function (originalData){
		var modifiedData = originalData.replace(Config.regex, "images/");
		return modifiedData;
	},

	deleteUselessImages(folderRoute, questionData){
		var images = [];

		try{
			images = fs.readdirSync(folderRoute);
		} catch (e) {
			images.map(function(image){
				if(questionData.indexOf(image) === -1){
						fsx.removeSync(`${folderRoute}/${image}`);
				}
			});
		}

	},

	writeManifest: function (routeManifest, metadata, next){
		fs.readFile(routeManifest, 'utf8', function (err, xmlManifest) {
			if (err) {
				next(err);
				return;
			}

			if(metadata) {
				xmlManifest = xmlManifest.replace(/_title_/g, metadata.title);
				xmlManifest = xmlManifest.replace(/_description_/g, metadata.description);
				xmlManifest = xmlManifest.replace(/_keywords_/g, metadata.keywords);
				xmlManifest = xmlManifest.replace(/_coverage_/g, metadata.coverage);
				xmlManifest = xmlManifest.replace(/_autor_/g, metadata.autor);
				xmlManifest = xmlManifest.replace(/_entity_/g, metadata.editor);
				xmlManifest = xmlManifest.replace(/_date_/g, metadata.date);
				xmlManifest = xmlManifest.replace(/_language_/g, metadata.language);
			}

			fs.writeFile(routeManifest, xmlManifest, function (err) {
				if (err) {
					next(err);
					return;
				}
				next();
			});
		});
	},

	question: {

		writeQuestionFile: function(question) {
			return new Promise(function(resolve, reject) {
				var route = path.resolve(__dirname, `../../questions/${question._id}/js/xml-question.js`);
				var data = "var question = " + JSON.stringify(question) + "; window.question = window.question || question;";
				fs.writeFile(route, data, function (err) {
					if(err)
						reject(err);
					else
						resolve(question);
				});
			});
		},

		updateData: function (questionId, data, cb) {
			var conditions = {
					_id: questionId
				},
				update = {
					"$set": {
						"formulation": data.formulation,
						"variables": data.variables,
						"answer": data.answer,
						"metadata": data.metadata
					}
				};

			return Question.update(conditions, update);
		},

		updateFields: function (questionId, data, cb) {
			console.log("Updating....", questionId, data);
			var conditions = {
					_id: questionId
				};
		 var update = {
				"$set": data
			};

			Question.update(conditions, update, function (err, rows) {
				if (err) {
					console.log(err);
					cb(err);
					return;
				} else {
					console.log("Saved!");
				}

				cb(null);
			});
		},

		addImage: function (questionId, imageName, cb) {

			var conditions = {
					_id: questionId
				},
				update = {
					"$push": {
						"images": imageName
					}
				};

			Question.update(conditions, update, function (err, rows) {

				if (err) {
					cb(err);
					return;
				}

				if (rows.n == 0) {
					cb(new Error("Question not found"));
					return;
				}

				cb(null);
			});
		},

		getById: function (questionId, cb) {
			Question.findById(questionId, cb);
		}

	}
};