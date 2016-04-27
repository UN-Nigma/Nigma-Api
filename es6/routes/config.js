var express = require('express');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var multer = require('multer');
var router = express.Router();
var routes = require('./routes');
var _ = require('underscore');
module.exports = function (app) {

	var storage = multer.diskStorage({
		destination: function (req, file, cb) {
			const url = req.url;
			const questionId = url.match("/api/questions/(.*)/scorms/uploadfiles")[1];
			var resolvedPath = path.resolve(__dirname, `../../questions/${questionId}/images`)
			cb(null, resolvedPath);
		}
	});

	app.use(multer({
		storage: storage,
		rename: function (fieldname, filename) {
			var name = uniqid();
			return name;
		},
		onFileUploadStart: function (file) {
			console.log(file.originalname + ' is starting ...')
		},
		onFileUploadComplete: function (file) {
			console.log(file.fieldname + ' uploaded to  ' + file.path);
			done = true;
		}
	}).any());


	arangeRoutes(routes, router);
	app.use('/api', router);
};

var arangeRoutes = function (routes, app) {

	_.each(routes, function (route) {
		console.log(route);
		var args = _.flatten([route.path, route.middleware]);
		console.log(route.httpMethod.toUpperCase() + ":\t" + route.path);
		switch (route.httpMethod.toUpperCase()) {
			case 'GET':
			app.get.apply(app, args);
			break;
			case 'POST':
			app.post.apply(app, args);
			break;
			case 'PUT':
			app.put.apply(app, args);
			break;
			case 'DELETE':
			app.delete.apply(app, args);
			break;
			default:
			throw new Error('Invalid HTTP method specified for route ' + route.path);
		}
	});
};