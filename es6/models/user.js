var mongoose = require('mongoose'),
	validator = require('validator'),
	validate = require('mongoose-validator'),
	jwt = require('jsonwebtoken'),
	Folder = mongoose.model('folder'),
	Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var User = Schema(
	{
		email: {type: String, required: true, unique: true, trim: true},
		pass: String,
		name: String,
		root_folder: {type: Schema.Types.ObjectId, ref: 'folder'},
		root_shared_folder: {type: Schema.Types.ObjectId, ref: 'folder'},
		photo: {
			public_url: String,
			format: String,
			cloud_id: String
		}
	}
);

User.set('toJSON', {
	transform: function (doc, ret, options) {
		delete ret.pass;
		delete ret.salt;
		delete ret.__v;
	}
});


User.path('email').validate(function (value, next) {
	next(validator.isEmail(value));
}, 'Invalid email');


User.statics = {

	getById(userId, fields, cb) {
		return this.findById(userId, fields).exec();
	},

	getByEmail(email, fields, cb) {
		return this.findOne({email: email}, fields).exec();
	},

	create(data) {
		return new Promise(function(resolve, reject) {
			var color = ['4EAD3E', '6FC6D9', 'F8CB3A', 'E5204E'][Math.floor(Math.random() * 4)];
			var photo = {
				public_url: 'http://dummyimage.com/100x100/ffffff/' + color + '&text=' + data.name.charAt(0).toUpperCase()
			};
			var rootFolder = new Folder();
			rootFolder.name = "Mis preguntas";
			var rootSharedFolder = new Folder();
			rootSharedFolder.name = "Compartidos conmigo";
			var user = new User({
				email: data.email,
				name: data.name,
				photo: photo,
				root_folder: rootFolder,
				root_shared_folder: rootSharedFolder
			});
			rootFolder.owner = user._id;
			rootSharedFolder.owner = user._id;
			rootFolder.save().then(function(folder) {
				return rootSharedFolder.save();
			}).then(function() {
				return new Promise(function(resolve, reject) {
					user.setPassword(data.pass, function(error, user) {
						if(error)
							reject(error);
						else
							resolve(user);
					});
				})
			}).then(function(user) {
				return user.save();
			}).then(function(user) {
				//Cleaning user object
				user.pass = undefined;
				user.folders = undefined;
				var token = jwt.sign(user, "zVTcnZgLTWoNxAidDbOwQQuWfKRwVC");
				console.log(user);
				resolve({ok: true, token: token});
			}).catch(function(error) {
				console.error(error)
				reject(error)
			})
		});

	}
};

User.plugin(require('passport-local-mongoose'), {
	usernameField: 'email',
	hashField: 'pass',
	usernameLowerCase: true
});

User = mongoose.model('user', User);
module.exports = User;
