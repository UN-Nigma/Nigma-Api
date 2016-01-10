
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

	copyImages: function (images, cb) {
		fsx.removeSync(path.resolve(__dirname, '../scorm-template/images'));
		fsx.mkdirsSync(path.resolve(__dirname, '../scorm-template/images'));
		images.map(function (image) {

			fsx.copySync(path.resolve(__dirname, '../images/' + image), path.resolve(__dirname, '../scorm-template/images/' + image));
		});
		cb(true);
	},

	copyScormTemplate: function (folderName) {
		fsx.copySync(path.resolve(__dirname, '../../scorm-template'), path.resolve(__dirname, '../../questions/' + folderName));
	},

	copyFolderQuestion: function (folderRoute, copyFolderRoute) {
		fsx.copySync(folderRoute, copyFolderRoute);
	},

	updateImagesUrls: function (originalData){
		/*
		var modifiedData = originalData.replace(/http:\/\/[^]*\/static\//, "images/");
		*/
		var modifiedData = originalData.replace(Config.regex, "images/");

		return modifiedData;
	},

	deleteUselessImages(folderRoute, questionData){
		var images = [];

		try{
			images = fs.readdirSync(path.resolve(__dirname, folderRoute));
		} catch (e) {
			images.map(function(image){
				if(questionData.indexOf(image) === -1){
						fsx.removeSync(path.join(__dirname, `${folderRoute}/${image}`));
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
				xmlManifest = xmlManifest.replace(/_title_/, metadata.title);
				xmlManifest = xmlManifest.replace(/_description_/, metadata.description);
				xmlManifest = xmlManifest.replace(/_keywords_/, metadata.keywords);
				xmlManifest = xmlManifest.replace(/_coverage_/, metadata.coverage);
				xmlManifest = xmlManifest.replace(/_autor_/, metadata.autor);
				xmlManifest = xmlManifest.replace(/_entity_/, metadata.editor);
				xmlManifest = xmlManifest.replace(/_date_/, metadata.date);
				xmlManifest = xmlManifest.replace(/_language_/, metadata.language);
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
				var route = "../../questions/" + question._id + "/js/xml-question.js";
				var data = "var question = " + JSON.stringify(question) + "; question = JSON.parse(question);window.question = window.question || question;";
				fs.writeFile(path.join(__dirname, route), data, function (err) {
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

			Question.update(conditions, update, function (err, rows) {
				if (err) {
					cb(err);
					return;
				}

				cb(null);
			});
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