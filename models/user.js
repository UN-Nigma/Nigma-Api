var mongoose = require('mongoose'),
  validator = require('validator'),
  validate = require('mongoose-validator'),
  Schema = mongoose.Schema;

var user = Schema(
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

user.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.pass;
    delete ret.salt;
    delete ret.__v;
  }
});


user.path('email').validate(function (value, next) {
  next(validator.isEmail(value));
}, 'Invalid email');


user.statics = {

  getById: function (userId, fields, cb) {
    this.findById(userId, fields, cb);
  },

  getByEmail: function (email, fields, cb) {
    this.findOne({email: email}, fields, cb);
  }

};

user.plugin(require('passport-local-mongoose'), {
  usernameField: 'email',
  hashField: 'pass',
  usernameLowerCase: true
});

module.exports = mongoose.model('user', user);
