var mongoose = require('mongoose'),
  async = require('async'),
  Schema = mongoose.Schema,
  _ = require("lodash");

var folder = Schema(
  {
    name: String,
    parent_folder: {type: String, ref: 'folder'},
    questions: [{type: Schema.Types.ObjectId, ref: 'question'}],
    folders: [{type: Schema.Types.ObjectId, ref: 'folder'}],
    owner: {type: String, required: true, ref: 'user'},
    users: [{type: String, ref: 'user'}],
    delete: Boolean
  }
);

folder.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.__v;
  }
});

folder.methods.create = function (cb) {
  this.save(cb);
};

folder.statics.getFoldersWithQuestions = function (userId, cb) {
  this.find({
    user: userId,
    $or: [
      {delete: false},
      {delete: {$exists: false}}
    ]
  })
    .populate('questions', "name", {
      $or: [
        {delete: false},
        {delete: {$exists: false}}
      ]
    })
    .exec(cb);
};

folder.statics.hasUser = function (folderId, userId){
   this.find({_id: folderId, users: userId}, function(err, folder){
     if(folder){
       return true;
     }

     return false;
   })
};

folder.statics.getAllData = function (folderId, cb) {
  var self = this;

  async.waterfall(
    [
      function (next) {
        self.findById(folderId)
          .populate('questions folders', 'name questions folders data owner parent_folder users', {
            $or: [
              {delete: false},
              {delete: {$exists: false}}
            ]
          }).exec(next);
      },
      function (rootFolder, next) {

        var foldersIds = [];
        var questionsIds = [];

        _.forEach(rootFolder.folders, function (folder) {

          _.forEach(folder.folders, function (folder) {
            foldersIds.push(folder);
          });

          _.forEach(folder.questions, function (question) {
            questionsIds.push(question);
          });

        });

        self.getByIds(foldersIds, function (err, subFolders) {

          var data = {
            rootFolder:rootFolder,
            subFolders:subFolders,
            questionsIds:questionsIds
          };

          next(err, data);
        });
      },
      function (data, next) {
        var Question = require('./question');

        Question.getByIds(data.questionsIds, function (err, subQuestions) {
          data.subQuestions = subQuestions;

          next(err, data);
        });
      },
      function (data, next) {
        rootFolder = data.rootFolder.toJSON();

        rootFolder.folders = _.map(rootFolder.folders, function (folder) {
          var folders = folder.folders;
          var questions = folder.questions;

          folder.folders = [];
          folder.questions = [];

          _.forEach(data.subFolders, function (subFolder) {

            _.forEach(folders, function (folderFromArray) {

              if(folderFromArray == subFolder._id.toString()){
                folder.folders.push(subFolder);
              }
            });

          });

          _.forEach(data.subQuestions, function (subQuestion) {

            _.forEach(questions, function (question) {

              if(question == subQuestion._id.toString()){
                folder.questions.push(subQuestion);
              }
            });

          });

          return folder;
        });


        next(null, rootFolder);
      }
    ],
    cb
  )
};

folder.statics.getByIds = function (foldersIds, cb) {
  this.find({
    _id: {
      $in: foldersIds
    }
  }).populate('questions folders', {
    $or: [
      {delete: false},
      {delete: {$exists: false}}
    ]
  }).exec(cb);
};


folder.statics.getById = function (folderId, cb) {
  this.findById(folderId, cb);
};

folder.statics.getFolderWithQuestions = function (folderId, cb) {
  this.findById(folderId).populate('questions', "name", {
    $or: [
      {delete: false},
      {delete: {$exists: false}}
    ]
  })
    .exec(cb);
};

folder.statics.getQuestionsFromFolders = function (foldersIds, userId, cb) {
  this.find({
    _id: {
      $in: foldersIds
    },
    user: {
      $ne: userId
    }
  })
    .populate('questions', "name", {
      $or: [
        {delete: false},
        {delete: {$exists: false}}
      ]
    })
    .exec(cb);
};

folder.statics.addFolder = function (parentFolderId, folderIdToAdd, cb) {
  var conditions = {
      _id: parentFolderId
    },
    update = {
      "$addToSet": {
        "folders": folderIdToAdd
      }
    };

  this.update(conditions, update, cb);
};

folder.statics.addQuestion = function (folderId, questionId, cb) {
  var conditions = {
      _id: folderId
    },
    update = {
      "$addToSet": {
        "questions": questionId
      }
    };

  this.update(conditions, update, cb);
};

folder.statics.updateName = function (folderId, name, cb) {
  var conditions = {
      _id: folderId
    },
    update = {
      "$set": {
        "name": name
      }
    };

  this.update(conditions, update, cb);
};

folder.statics.deleteById = function (folderId, cb) {
  var conditions = {
      _id: folderId
    },
    update = {
      "$set": {
        "delete": true
      }
    };

  this.update(conditions, update, cb);
};

module.exports = mongoose.model('folder', folder);
