'use strict';

var fs = require('fs');
var archiver = require('archiver');
var fsx = require('fs-extra');
var path = require('path');
var mongoose = require('mongoose');
var Question = mongoose.model('question');
var Config = require("../config/config");


module.exports = {

  zipFile: function (folderRoute, zipRoute, cb) {

    var output = fs.createWriteStream(zipRoute);
    var zipArchive = archiver('zip');

    output.on('close', function () {
      cb(true);
    });

    zipArchive.pipe(output);

    zipArchive.bulk([
      {src: ['**/*'], cwd: folderRoute, expand: true}
    ]);

    zipArchive.finalize(function (err, bytes) {
      if (err) {
        throw err;
      }
    });
  },

  deleteFolder: function (route){
    fsx.removeSync(route);
  },

  copyImages: function (images, cb) {
    fsx.removeSync(path.resolve(__dirname, '../scorm-template/images'));
    fsx.mkdirsSync(path.resolve(__dirname, '../scorm-template/images'));
    images.map(function (image) {

      fsx.copySync(path.resolve(__dirname, '../images/' + image), path.resolve(__dirname, '../scorm-template/images/' + image));
    });
    cb(true);
  },

  copyImagesToQuestionFolder: function (copyFolderRoute, images) {
    fsx.removeSync(copyFolderRoute + '/images');
    fsx.mkdirsSync( copyFolderRoute + '/images');

    images.map(function (imageName) {
      fsx.copySync(path.resolve(__dirname, '../images/' + imageName), copyFolderRoute + '/images/' + imageName);
    });
  },

  copyScormTemplate: function (folderName) {
    fsx.copySync(path.resolve(__dirname, '../scorm-template'), path.resolve(__dirname, '../questions/' + folderName));
  },

  copyFolderQuestion: function (folderRoute, copyFolderRoute) {
    fsx.copySync(folderRoute, copyFolderRoute);
  },

  updateImagesUrls: function (originalData){
    /*
    var modifiedData = originalData.replace(/http:\/\/[^]*\/static\//, "images/");
    */
    var modifiedData = originalData.replace(Config.regex, "images/");

    return modifiedData;
  },

  createManifest: function (xmlManifest, metadata) {

    xmlManifest = xmlManifest.replace(/_title_/, metadata.title );
    xmlManifest = xmlManifest.replace(/_description_/, metadata.description );
    xmlManifest = xmlManifest.replace(/_keywords_/, metadata.keywords );
    xmlManifest = xmlManifest.replace(/_coverage_/, metadata.coverage );
    xmlManifest = xmlManifest.replace(/_autor_/, metadata.autor );
    xmlManifest = xmlManifest.replace(/_entity_/, metadata.editor );
    xmlManifest = xmlManifest.replace(/_date_/, metadata.date );
    xmlManifest = xmlManifest.replace(/_language_/, metadata.language );

    return xmlManifest;
  },

  question: {

    updateData: function (questionId, data, cb) {
      var conditions = {
          _id: questionId
        },
        update = {
          "$set": {
            "data": data
          }
        };

      Question.update(conditions, update, function (err, rows) {
        if (err) {
          cb(err);
          return;
        }

        cb(null);
      });
    },

    addImage: function (questionId, imageName, cb) {

      var conditions = {
          _id: questionId
        },
        update = {
          "$push": {
            "images": imageName
          }
        };

      Question.update(conditions, update, function (err, rows) {

        if (err) {
          cb(err);
          return;
        }

        if (rows.n == 0) {
          cb(new Error("Question not found"));
          return;
        }

        cb(null);
      });
    },

    getById: function (questionId, cb) {
      Question.findById(questionId, cb);
    }

  }
};