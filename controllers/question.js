var mongoose = require('mongoose');
var Question = mongoose.model('question');
var Folder = mongoose.model('folder');
var async = require('async');
var uniqid = require('uniqid');
var helper = require('../lib/helper.js');
var QuestionHelper = helper.question;


module.exports = {

  createQuestion: function (req, res) {
    var user = req.user;
    var parentFolderId = req.params.folderid;

    async.waterfall(
      [
        function getDataParentFolder(next) {
          Folder.getById(parentFolderId, next);
        },
        function (parentFolder, next) {
          var question = new Question(
            {
              name: req.body.question.name,
              owner: user._id,
              parent_folder: parentFolder._id,
              users: parentFolder.users //The new question have the same users  acces from her parent
            }
          );

          question.create(function (err, question) {
            next(err, question);
          });
        },
        function (question, next) {
          Folder.addQuestion(parentFolderId, question._id, function (err, rows) {
            if (!err && rows.n == 0) {
              return next(new Error("Parent folder was not update"));
            }
            next(err, question);
          });
        }
      ],
      function (err, question) {
        if (err) {
          return res.status(400).json({
            ok: false,
            message: err.message
          });
        }

        res.status(200).json({
          ok: true,
          question: {
            _id: question._id,
            name: question.name
          }
        });
      }
    );
  },

  updateQuestion: function (req, res) {
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

  setData: function (req, res) {
    var question = req.body.question;
    var questionId = req.params.questionid;

    QuestionHelper.updateData(questionId, question.data, function (err, rows) {
      if (err) {
        return res.status(400).json({
          ok:false,
          message: err.message
        });
      }

      res.status(200).json({ok:true});
    });
  },

  deleteQuestion: function (req, res) {
    var questionId = req.params.questionid;

    Question.deleteById(questionId, function (err, rows) {
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
  }

};
