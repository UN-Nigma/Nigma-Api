var helper = require('../lib/helper.js');
var path = require('path');
var mime = require('mime');
var fs = require('fs');
var QuestionHelper = helper.question;
var _ = require('lodash');
var Config = require("../config/config");
const Answer = require('../lib/answers/answer');

module.exports = {


  uploadFiles(req, res) {

    var questionId = req.params.questionid;
    var imageFile;

    _.forIn(req.files, function (file, field) {
      imageFile = file.filename;
    });

    if(!imageFile){
      return res.status(400).json({
        ok: false,
        message:  "File was not sent"
      });
    }

    console.log("Este es el que se esta ejecutando, bueno ?");

    res.status(200).jsonp({uploaded: 1, url: Config.apiUrl + "/static/" + questionId + "/images/" + imageFile});
  }

};
