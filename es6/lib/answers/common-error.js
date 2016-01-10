const ExpressionEvaluator = require('../variables/expression-evaluator');
class CommonError {
  constructor() {
    this.values = {};
    this.message = "";
  }

  isValid(variables, answerNames) {
    var output = {error: false, messages: []};
    for(var j = 0; j < answerNames.length; j++) {
      var answerName = answerNames[j];
      var validation = ExpressionEvaluator.isEvaluable(this.values[answerName], variables);
      output.error = output.error || validation.error;
      output.messages = output.messages.concat(validation.messages);
    }
    return output;
  }

  static createFromResponse(commonErrorJson) {
    var commonError = new CommonError();
    commonError.values = commonErrorJson.values || {};
    commonError.message = commonErrorJson.message || "";
    return commonError;
  }
}
module.exports = CommonError;