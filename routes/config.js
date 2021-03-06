var express = require('express'),
  path = require('path'),
  _ = require('underscore'),
  fs = require('fs'),
  bodyParser = require('body-parser'),
  multer = require('multer');

var uniqid = require('uniqid');

var router = express.Router();

module.exports = function (app) {

  fs.readdirSync(__dirname).forEach(function (file) {
    if (file == "config.js") return;
    var name = file.substr(0, file.indexOf('.'));
    var routes = require(path.join(__dirname, name));
    arangeRoutes(routes, router);
  });

  app.use(multer({
    dest: './images/',
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
  }));

  // REGISTER OUR ROUTES -------------------------------
  // all of our routes will be prefixed with /api
  app.use('/api', router);

};

var arangeRoutes = function (routes, app) {
  _.each(routes, function (route) {
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