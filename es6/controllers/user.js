var mongoose = require('mongoose'),
  User = mongoose.model('user'),
  Folder = mongoose.model('folder'),
  async = require('async'),
  _ = require("lodash"),
  jwt = require('jsonwebtoken'),
  uniqid = require('uniqid');

var Question = mongoose.model('question');


module.exports = {

  create: function (req, res) {
    var password = req.body.user.pass;
    var colors = ['4EAD3E', '6FC6D9', 'F8CB3A', 'E5204E'];
    var number = Math.floor(Math.random() * 4);
    var userName = req.body.user.name;

    var photo = {
      public_url: 'http://dummyimage.com/100x100/ffffff/' + colors[number] + '&text=' + userName.charAt(0).toUpperCase()
    };

    var rootFolder = new Folder();
    var rootSharedFolder = new Folder();

    var user = new User({
      email: req.body.user.email,
      name: userName,
      photo: photo,
      root_folder: rootFolder._id,
      root_shared_folder: rootSharedFolder._id
    });

    rootFolder.owner = user._id;
    rootSharedFolder.owner = user._id;

    async.waterfall(
      [
        function (next) {
          rootFolder.create(function (err, folder) {
            next(err);
          });
        },
        function (next) {
          rootSharedFolder.create(function (err, folder) {
            next(err);
          });
        },
        function (next) {
          user.setPassword(password, function (err, user) {
            next(err, user);
          });
        },
        function (user, next) {
          user.save(function (err, user) {
            next(err, user);
          });
        }
      ],
      function (err, user) {
        if (err) {
          return res.status(400).json({
            ok: false,
            message: err.message
          });
        }

        //Cleaning user object
        user.pass = undefined;
        user.folders = undefined;

        var token = jwt.sign(user, "zVTcnZgLTWoNxAidDbOwQQuWfKRwVC");

        res.status(200).json({ok: true, token: token});
      }
    );
  },

  login: function (req, res) {
    var user = req.body.user;

    User.authenticate()(user.email, user.pass, function (err, user, message) {
      if (err) {

        return res.status(400).json({
          ok: false,
          message: err.message
        });
      } else if (!user) {

        return res.status(401).json({
          ok: false,
          message: "Email or password invalid"
        });
      }

      //Cleaning user object
      user.pass = undefined;
      user.folders = undefined;

      var token = jwt.sign(user, "zVTcnZgLTWoNxAidDbOwQQuWfKRwVC");

      res.status(200).json({
        ok: true,
        token: token
      });
    });
  },

  getInfo: function (req, res) {
    var user = req.user;

    User.getById(user._id, 'name email photo')
      .then(function(user){
        res.status(200).json({
          ok: true,
          user: user
        });
      })
      .catch(function(error) {
        res.status(400).json({
          ok: false,
          message: error.message
        });
      });
  },

  sharedFolder: function (req, res) {
    var folderIdToAdd = req.params.folderid;
    var email = req.body.user.email;

    User.getByEmail(email, 'root_shared_folder', function (err, user) {
      if (!user)
        return res.status(400).json({
          ok: false,
          message: "The email does not exist in the data base"
        });
      var rootSharedFolderId = user.root_shared_folder;

      if (Folder.hasUser(folderIdToAdd, user._id)) {
        return res.status(400).json({
          ok: false,
          message: "The user has the shared folder"
        });
      }

      Folder.addFolder(rootSharedFolderId, folderIdToAdd, function (err) {
        if (err) {
          return res.status(400).json({
            ok: false,
            message: err.message
          });
        }

        res.status(200).json({
          ok: true
        });
      })
    });
  },

  sharedQuestion: function (req, res) {
    var questionId = req.params.questionid;
    var email = req.body.user.email;

    async.waterfall(
      [
        function (next) {
          User.getByEmail(email, "root_shared_folder", function (err, user) {
            next(err, user);
          });
        },
        function (user, next) {
          var rootSharedFolderId = user.root_shared_folder;

          if (Question.hasUser(questionId, user._id)) {
            return res.status(400).json({
              ok: false,
              message: "The user has the shared question"
            });
          }

          Folder.addQuestion(rootSharedFolderId, questionId, next);
        }
      ],
      function (err) {
        if (err) {
          return res.status(400).json({
            ok: false,
            message: err.message
          });
        }

        res.status(200).json({ok: true});
      }
    );
  },

  getRootsFolders: function (req, res) {
    var userId = req.user._id;
    User.getById(userId, 'root_folder root_shared_folder')
      .then(function(user) {
        var promises = [Folder.getById(user.root_folder), Folder.getById(user.root_shared_folder)]
        Promise.all(promises).then(function(folders) {
          res.status(200).json({
             ok: true,
             root_folder: folders[0],
             root_shared_folders: folders[1]
          });
        });
      })
      .catch(function(error) {
        console.error(error);
        res.status(400).json({
          ok: false,
          message: err.message
        });
      })
  }

};
