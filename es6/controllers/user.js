var mongoose = require('mongoose'),
	User = mongoose.model('user'),
	Folder = mongoose.model('folder'),
	async = require('async'),
	_ = require("lodash"),
	jwt = require('jsonwebtoken'),
	uniqid = require('uniqid');

var Question = mongoose.model('question');


module.exports = {

	create: function (req, res) {
		var data = req.body.user;
		User.create(data).then(function(ret) {
			res.status(200).json(ret);
		}).catch(function(ret) {
			console.error(ret);
			res.status(400).json({ok: false})
		})
	},

	login: function (req, res) {
		var user = req.body.user;

		User.authenticate()(user.email, user.pass, function (err, user, message) {
			if (err) {

				return res.status(400).json({
					ok: false,
					message: err.message
				});
			} else if (!user) {

				return res.status(401).json({
					ok: false,
					message: "Email or password invalid"
				});
			}

			//Cleaning user object
			user.pass = undefined;
			user.folders = undefined;

			var token = jwt.sign(user, "zVTcnZgLTWoNxAidDbOwQQuWfKRwVC");

			res.status(200).json({
				ok: true,
				token: token
			});
		});
	},

	getInfo: function (req, res) {
		var user = req.user;

		User.getById(user._id, 'name email photo')
			.then(function(user){
				res.status(200).json({
					ok: true,
					user: user
				});
			})
			.catch(function(error) {
				res.status(400).json({
					ok: false,
					message: error.message
				});
			});
	},

	sharedFolder: function (req, res) {
		var folderIdToAdd = req.params.folderid;
		var email = req.body.user.email;

		User.getByEmail(email, 'root_shared_folder', function (err, user) {
			if (!user)
				return res.status(400).json({
					ok: false,
					message: "The email does not exist in the data base"
				});
			var rootSharedFolderId = user.root_shared_folder;

			if (Folder.hasUser(folderIdToAdd, user._id)) {
				return res.status(400).json({
					ok: false,
					message: "The user has the shared folder"
				});
			}

			Folder.addFolder(rootSharedFolderId, folderIdToAdd, function (err) {
				if (err) {
					return res.status(400).json({
						ok: false,
						message: err.message
					});
				}

				res.status(200).json({
					ok: true
				});
			})
		});
	},

	sharedQuestion: function (req, res) {
		var questionId = req.params.questionid;
		var email = req.body.user.email;

		async.waterfall(
			[
				function (next) {
					User.getByEmail(email, "root_shared_folder", function (err, user) {
						next(err, user);
					});
				},
				function (user, next) {
					var rootSharedFolderId = user.root_shared_folder;

					if (Question.hasUser(questionId, user._id)) {
						return res.status(400).json({
							ok: false,
							message: "The user has the shared question"
						});
					}

					Folder.addQuestion(rootSharedFolderId, questionId, next);
				}
			],
			function (err) {
				if (err) {
					return res.status(400).json({
						ok: false,
						message: err.message
					});
				}

				res.status(200).json({ok: true});
			}
		);
	},

	getUserFolder: function (req, res) {
		var userId = req.user._id;
		User.getById(userId, 'root_folder')
			.then(function(user) {
				Folder.getById(user.root_folder).then(function(folder) {
					res.status(200).json({
						 ok: true,
						 root_folder: folder,
					});
				});
			})
			.catch(function(error) {
				console.error(error);
				res.status(400).json({
					ok: false,
					message: err.message
				});
			})
	},
	getUserSharedFolder: function(req, res) {
		var userId = req.user._id;
		User.getById(userId, 'root_shared_folder')
			.then(function(user) {
				Folder.getById(user.getUserSharedFolder).then(function(folder) {
					res.status(200).json({
						 ok: true,
						 root_folder: folder,
					});
				});
			})
			.catch(function(error) {
				console.error(error);
				res.status(400).json({
					ok: false,
					message: err.message
				});
			})
	}

};
