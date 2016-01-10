var mongoose = require('mongoose'),
  async = require('async'),
  Schema = mongoose.Schema,
  _ = require("lodash");

var Question = require('./question');

mongoose.Promise = global.Promise;

var folder = Schema(
  {
    name: String,
    parent_folder: {type: String, ref: 'folder'},
    questions: [{type: Schema.Types.ObjectId, ref: 'question'}],
    folders: [{type: Schema.Types.ObjectId, ref: 'folder'}],
    owner: {type: String, required: true, ref: 'user'},
    users: [{type: String, ref: 'user'}],
    deleted: {type: Boolean, required: true, default: false},
    update_at: Date,
    created_at: Date
  }
);

var autoPopulateData = function(next) {
    this.populate({
    	path: 'questions',
    	match: {deleted: false}
    });
    this.populate({
    	path: 'folders',
    	match: {deleted: false}
    });

    next();
};

var beforeSave = function(next) {
  this.update_at = new Date();
  if(this.isNew) {
    this.created_at = new Date();
  }
  next();
};

//Callbacks
folder.pre('find', autoPopulateData)
  .pre('findOne', autoPopulateData)
  .pre('findById', autoPopulateData)
  .pre('save', beforeSave)
  .pre('update', beforeSave);

folder.pre('save', function(next) {
  this.update_at = new Date();
  if(!this.isNew) {
    this.created_at = new Date();
  }
  next();
});
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
      {deleted: false},
      {deleted: {$exists: false}}
    ]
  })
    .populate('questions', "name", {
      $or: [
        {deleted: false},
        {deleted: {$exists: false}}
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


folder.statics.getById = function (folderId, cb) {
  return this.findOne({_id: folderId, deleted: false}).exec();
};


folder.statics.getFolderWithQuestions = function (folderId, cb) {
  this.findById(folderId).populate('questions', "name", {
    $or: [
      {deleted: false},
      {deleted: {$exists: false}}
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
        {deleted: false},
        {deleted: {$exists: false}}
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
        "deleted": true
      }
    };

  this.update(conditions, update, cb);
};

module.exports = mongoose.model('folder', folder);
