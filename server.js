var debug = require('debug')('gen-scorm1.2-api');
var http  = require('http');
var app   = require('./app');

app.set('port', process.env.PORT || 4000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});