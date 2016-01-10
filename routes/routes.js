var Scorm = require('../controllers/scorm'),
    UserCtrl = require('../controllers/user'),
    QuestionCtrl = require('../controllers/question'),
    FolderCtrl = require('../controllers/folder');

var routes = [

  //Scorm
  {path: '/questions/:questionid/scorms',  httpMethod: 'POST',   middleware: [Scorm.zipScorm]},
  {path: '/questions/:questionid/scorms',  httpMethod: 'PUT',    middleware: [Scorm.update]},
  {path: '/questions/:questionid/scorms',  httpMethod: 'GET',    middleware: [Scorm.Download]},
  {path: '/questions/:questionid/scorms/uploadfiles',   httpMethod: 'POST',   middleware: [Scorm.uploadFiles]},

  // Folder
  {path: '/folders/:folderid/folders',   httpMethod: 'POST',   middleware: [FolderCtrl.create]},
  {path: '/folders/:folderid',           httpMethod: 'PUT',    middleware: [FolderCtrl.update]},
  {path: '/folders/:folderid',           httpMethod: 'DELETE', middleware: [FolderCtrl.delete]},

  //Question
  {path: '/folders/:folderid/questions', httpMethod: 'POST',   middleware: [QuestionCtrl.createQuestion]},
  {path: '/questions/:questionid/name',  httpMethod: 'PUT',    middleware: [QuestionCtrl.updateQuestion]},
  {path: '/questions/:questionid/data',  httpMethod: 'PUT',    middleware: [QuestionCtrl.setData       ]},
  {path: '/questions/:questionid',       httpMethod: 'DELETE', middleware: [QuestionCtrl.deleteQuestion]},

  //User
  {path: '/users',                       httpMethod: 'POST',   middleware: [UserCtrl.create]},
  {path: '/users/data',                  httpMethod: 'GET',    middleware: [UserCtrl.getInfo]},
  {path: '/users/login',                 httpMethod: 'POST',   middleware: [UserCtrl.login]},
  {path: '/users/questions/:questionid', httpMethod: 'POST',   middleware: [UserCtrl.sharedQuestion]},
  {path: '/users/folders/:folderid',     httpMethod: 'POST',   middleware: [UserCtrl.sharedFolder]},
  {path: '/users/folders',               httpMethod: 'GET',    middleware: [UserCtrl.getRootsFolders]}

];

module.exports = routes;
