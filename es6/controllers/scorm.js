var helper = require('../lib/helper.js');
var path = require('path');
var mime = require('mime');
var fs = require('fs');
var QuestionHelper = helper.question;
var _ = require('lodash');
var Config = require("../config/config");
const Answer = require('../lib/answers/answer');

module.exports = {

  zipScorm: function (req, res) {
    var questionId = req.params.questionid;
    var originFolderRoute = "./questions/" + questionId;
    var copyFolderRoute = "./questions/" + questionId + "-scorm";
    var zipRoute = "./questions/" + questionId + ".zip";
    var scormQuestionDataRoute = copyFolderRoute + "/js/xml-question.js";
    var routeManifest = copyFolderRoute + "/imsmanifest.xml";


    //Copy question folder for updated her data before zip
    helper.copyFolderQuestion(originFolderRoute, copyFolderRoute);

    QuestionHelper.getById(questionId, function (err, question) {
      if (err || !question) {
        return res.status(400).json({
          ok: false,
          message: "Oops! Something went wrong!"
        });
      }

      var originalData = JSON.stringify(question.data);
      var modifiedData = helper.updateImagesUrls(originalData);
      var data = "var question = " + modifiedData + "; question = JSON.parse(question);window.question = window.question || question;";
      var metadata = question.metadata;

      //Refactorizar, muchos callback (Usar promises)

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
    })
  },

  preview: function (req, res) {
    var question = req.body.question;
    var questionId = req.params.questionid;
    QuestionHelper.updateData(questionId, question, function (err, rows) {
      if (err) {
        return res.status(400).json({
          ok: false,
          message: err.message
        });
      }
      var answer = question.answer;
      var variableText = question.variables;
      var output = Answer.validateAnswer(answer, variableText);
      question.answer = output.answer;
      question.variables = {
      	text:  variableText,
      	variables: output.variables
      }
      if(output.ok) {
      	var route = "../../questions/" + questionId + "/js/xml-question.js";
      	var data = "var question = " + JSON.stringify(question) + "; question = JSON.parse(question);window.question = window.question || question;";
      	fs.writeFile(path.join(__dirname, route), data, function (err) {
      	  if (err) {
      	    console.log(err.stack);
      	    return res.status(400).jsonp({ok: false, message: err});
      	  }

      	  res.status(200).jsonp({ok: true, url: Config.apiUrl + "/static/" + questionId + "/launch.html"});
      	});
      } else {
      	res.status(400).json({
      		ok: false
      	})
      }


    });
  },

  Download: function (req, res) {
    var questionId = req.params.questionid;
    var file = "./questions/" + questionId + ".zip";

    res.setHeader('Content-disposition', 'attachment; filename=' + path.basename(file));
    res.setHeader('Content-type', mime.lookup(file));

    fs.createReadStream(file).pipe(res);
  },

  uploadFiles: function (req, res) {

    console.log("Siiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
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

    res.status(200).jsonp({url: Config.apiUrl + "/static/" + questionId + "/images/" + imageFile});
  }

};
