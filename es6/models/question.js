
var mongoose = require('mongoose'),
	async = require('async'),
	Schema = mongoose.Schema,
	Folder = require('./folder');

var Question = mongoose.Schema(
	{
		answer: Schema.Types.Mixed,
		variables: String,
		formulation: String,
		metadata: Schema.Types.Mixed,
		name: String,
		parent_folder: {type: String, required: true, ref: 'folder'},
		owner: {type: String, required: true, ref: 'user'},
		users: [{type: String, required: true, ref: 'user'}],
		images: [{type: String}],
		deleted: {type: Boolean, required: true, default: false},
		update_at: Date,
		created_at: Date
	}
);

Question.pre('save', function(next) {
	this.update_at = new Date();
	if(this.isNew) {
		this.created_at = new Date();
	}
	next();
});

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
					owner: user._id,
					parent_folder: parentFolder._id,
					users: parentFolder.users,
					variables: "",
					answer: {},
					formulation: "",
					metadata: {}
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

Question.statics.updateData = function (questionId, data, cb) {
	data = JSON.parse(data)
	var conditions = {
			_id: questionId
		},
		update = {
			"$set": {
				"metadata": JSON.stringify(data.metadata),
				"answer": JSON.stringify(data.answer),
				"variable": data.variables,
				"formulation": JSON.stringify(data.formulation),
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
Question = mongoose.model('question', Question);
module.exports = Question;
