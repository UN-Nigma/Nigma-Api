var Scorm = require('../controllers/scorm'),
    UserCtrl = require('../controllers/user'),
    QuestionCtrl = require('../controllers/question'),
    FolderCtrl = require('../controllers/folder');

var routes = [

  //Scorm
  {path: '/questions/:questionid/scorms/uploadfiles',   httpMethod: 'POST',   middleware: [Scorm.uploadFiles]},


  // Folder
  {path: '/folders/:folderid/folders',   httpMethod: 'POST',   middleware: [FolderCtrl.create]},
  {path: '/folders/:folderid',           httpMethod: 'PUT',    middleware: [FolderCtrl.update]},
  {path: '/folders/:folderid',           httpMethod: 'DELETE', middleware: [FolderCtrl.delete]},
  {path: '/folders/:folderid',           httpMethod: 'GET', middleware: [FolderCtrl.get]},

  //Question
  {path: '/folders/:folderid/questions', httpMethod: 'POST',   middleware: [QuestionCtrl.createQuestion]},
  {path: '/questions/:questionid/data',  httpMethod: 'PUT',    middleware: [QuestionCtrl.saveQuestion       ]},
  {path: '/questions/:questionid',       httpMethod: 'DELETE', middleware: [QuestionCtrl.deleteQuestion]},
  {path: '/questions/:questionid',       httpMethod: 'GET', middleware: [QuestionCtrl.getQuestion]},
  {path: '/questions/:questionid/preview',       httpMethod: 'PUT', middleware: [QuestionCtrl.previewQuestion]},
  {path: '/questions/:questionid/export',       httpMethod: 'PUT', middleware: [QuestionCtrl.exportQuestion]},
  {path: '/questions/:questionid/export/download',       httpMethod: 'GET', middleware: [QuestionCtrl.exportQuestionDownload]},
  {path: '/questions/:questionid/variables/validate',       httpMethod: 'PUT', middleware: [QuestionCtrl.validateVariables]},
  {path: '/questions/:questionid/answers/validate',       httpMethod: 'PUT', middleware: [QuestionCtrl.validateAnswer]},

  //User
  {path: '/users',                       httpMethod: 'POST',   middleware: [UserCtrl.create]},
  {path: '/users/data',                  httpMethod: 'GET',    middleware: [UserCtrl.getInfo]},
  {path: '/users/login',                 httpMethod: 'POST',   middleware: [UserCtrl.login]},
  {path: '/users/questions/:questionid', httpMethod: 'POST',   middleware: [UserCtrl.sharedQuestion]},
  {path: '/users/folders/:folderid',     httpMethod: 'POST',   middleware: [UserCtrl.sharedFolder]},
  {path: '/users/folders',               httpMethod: 'GET',    middleware: [UserCtrl.getUserFolder]},
  {path: '/users/folders/shared-with-me',               httpMethod: 'GET',    middleware: [UserCtrl.getUserSharedFolder]}

];


module.exports = routes;
