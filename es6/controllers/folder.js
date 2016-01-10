var mongoose = require('mongoose'),
  Folder = mongoose.model('folder'),
  User = mongoose.model('user'),
  Question = mongoose.model('question'),
  Q = require('q'),
  uniqid = require('uniqid'),
  async = require('async');


module.exports = {

  create: function (req, res) {
    var folderName = req.body.folder.name;
    var parentFolderId = req.params.folderid;
    var user = req.user;
    Folder.getById(parentFolderId)
      .then(function(parentFolder) {
        var newFolder = new Folder({
          name: folderName,
          owner: user._id,
          parent_folder: parentFolder._id,
          users: parentFolder.users //The new folder have the same users  acces from her parent
        });
        return newFolder.save();
      })
      .then(function(folder) {
        return new Promise(function(resolve, reject) {
          Folder.addFolder(parentFolderId, folder._id, function (err, rows) {
            if(err){
              reject(err);
            } else if (rows.n == 0) {
              reject(new Error("Parent folder was not update"));
            } else {
              resolve(folder)
            }
          });
        })
      })
      .then(function(folder) {
        res.status(200).json({
          ok: true,
          folder: {
            _id: folder._id,
            name: folder.name
          }
        });
      })
      .catch(function(error) {
        res.status(400).json({
            ok: false,
            message: error.message
          });
      })
  },

  update: function (req, res) {
    var folder = req.body.folder,
      folderId = req.params.folderid;

    Folder.updateName(folderId, folder.name, function (err, rows) {
      if (err) {
        return res.status(400).json({
          ok: false,
          message: err.message
        });
      }

      if (rows.n == 0) {
        return res.status(400).json({
          ok: false,
          message: "The folder does not exist"
        });
      }

      res.status(200).json({
        ok: true
      });
    });
  },

  delete: function (req, res) {
    var folderId = req.params.folderid;

    Folder.deleteById(folderId, function (err, rows) {
      if (err) {
        return res.status(400).json({
          ok: false,
          message: err.message
        });
      }

      if (rows.n == 0) {
        return res.status(400).json({
          ok: false,
          message: "The folder does not exist"
        });
      }

      res.status(200).json({
        ok: true
      });
    });
  }

};
