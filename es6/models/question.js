
var mongoose = require('mongoose'),
	async = require('async'),
	Schema = mongoose.Schema,
	Folder = require('./folder'),
	QuestionLib = require('../lib/answers/answer');

var Question = mongoose.Schema(
	{
		name: {type: String, required: true},
		type: {type: String, default: "Complete", required: true},
		answer: Schema.Types.Mixed,
		variables: String,
		formulation: String,
		metadata: Schema.Types.Mixed,
		parent_folder: {type: Schema.Types.ObjectId, required: true, ref: 'folder'},
		owner: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
		users: [{type: Schema.Types.ObjectId, required: true, ref: 'user'}],
		images: [{type: String}],
		deleted: {type: Boolean, required: true, default: false},
		updated_at: Date,
		created_at: Date
	}
);


var postFind = function(doc) {
	var self = doc;
	self.answer = self.answer || new QuestionLib(self.type);
	if(!self.metadata)
		self.metadata = {
			title: self.name,
			description: null,
			keywords: null,
			coverage: null,
			autor: null,
			editor: null,
			date: self.created_at,
			language: null
		}
};

Question.pre('save', function(next) {
	this.updated_at = new Date();
	if(this.isNew) {
		this.created_at = new Date();
	}
	var answer = this.answer;
	if(answer != null){
		for(var i = 0; i < answer.correctValues.length; i++) {
			var correctValue = answer.correctValues[i];
			for(var key in correctValue) {
				if(answer.names.indexOf(key) == -1) {
					delete correctValue[key];
				}
			}
		}

		for(var i = 0; i < answer.commonErrors.length; i++) {
			var commonError = answer.commonErrors[i].values;
			for(var key in commonError) {
				if(answer.names.indexOf(key) == -1) {
					delete commonError[key];
				}
			}
		}
	}
	next();
}).post('find', postFind)
	.post('findOne', postFind)
	.post('findOneAndUpdate', postFind);;





Question.set('toJSON', {
	transform: function (doc, ret, options) {
		delete ret.__v;
		delete ret.folder;
	}
});

Question.statics.createQuestion = function (questionName, user, parentFolderId, helper) {
	return new Promise(function(resolve, reject) {
		var parentFolderInstance = null;
		var newQuestionInstance = null;
		Folder.getById(parentFolderId)
			.then(function(parentFolder) {
				parentFolderInstance = parentFolder;
				newQuestionInstance = new Question({
					name: questionName,
					owner: user,
					parent_folder: parentFolder._id,
					users: parentFolder.users,
					variables: "",
					answer: null,
					formulation: "",
					metadata: null
				})
				return newQuestionInstance.save();
			})
			.then(function(question) {
				parentFolderInstance.questions.addToSet(question._id)
				return parentFolderInstance.save();
			})
			.then(function(parentFolder) {
				return new Promise(function(resolve, reject) {
					//Create or update question folder with scorm template
					try {
						helper.copyScormTemplate(newQuestionInstance._id);
						helper.question.writeQuestionFile(newQuestionInstance)
							.then(function(question) {
								resolve(question)
							})
							.catch(function(error) {reject(error)})
					} catch(error) {
						reject(error);
					}
				})
			})
			.then(function(newQuestion) {
				resolve(newQuestion);
			})
			.catch(function(error) {
				reject(error);
			})
	})
};

Question.statics.getByIds = function(questionsIds, cb){
	this.find({
		_id: {
			$in: questionsIds
		},
		$or: [
			{deleted: false},
			{deleted: {$exists: false}}
		]
	}, cb);
};

Question.statics.hasUser = function (questionId, userId){
	this.find({_id: questionId, users: userId}, function(err, question){
		if(question){
			return true;
		}
		return false;
	})
};

Question.statics.updateName = function (questionId, name, cb) {
	var conditions = {
			_id: questionId
		},
		update = {
			"$set": {
				"name": name
			}
		};

	this.update(conditions, update, cb);
};

Question.statics.updateFields = function (questionId, data) {
	return this.findOneAndUpdate({_id: questionId}, data);
};

Question.statics.deleteById = function (questionId, helper) {
	const folderRoute = `./questions/${questionId}`;
	return new Promise(function(resolve, reject) {
		Question.updateFields(questionId, {deleted: true})
			.then(function(question) {
				try {
					helper.deleteFolder(folderRoute);
					resolve(question);
				} catch (error) {
					reject(error);
				}
			})
	});
};

Question.statics.getById = function (questionId, fields) {
	if(fields != undefined && fields != null)
		return this.findOne({_id: questionId, deleted: false}, fields).populate('owner').exec();
	else
		return this.findOne({_id: questionId, deleted: false}).populate('owner').exec();

};

Question = mongoose.model('question', Question);
module.exports = Question;
