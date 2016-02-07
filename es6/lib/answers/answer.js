const CommonError = require('./common-error');
const ExpressionEvaluator = require('../variables/expression-evaluator');
const Variable = require('../variables/variable');
const uniqid = require('uniqid');
const VariableParser = require('../variables/parser');
class Answer {
	constructor() {
		this.names = [];
		this.correctValues = [];
		this.showLabel = true;
		this.precision = 0;
		this.commonErrors = [];
		this._id = uniqid();
		this.code = null;
	}

	addCommonError() {
		this.commonErrors.push(new CommonError());
	}

	isValid(variables, type = "Complete") {

		if(type == "Complete") {
			var output = {error: false, messages: {commonErrors: [], correctValues: [], precision: []}}
			var correctValuesValidation = this._validateCorrectValues(variables);
			var commonErrorValidation = this._validateCommonErrors(variables);

			output.messages.correctValues = correctValuesValidation.messages;
			output.error = output.error || correctValuesValidation.error;

			output.messages.commonErrors = commonErrorValidation.messages;
    	output.error = output.error || commonErrorValidation.error;

			return output;
		}

	}

	_validateCommonErrors(variables) {
		var output = {error: false, messages: []};
		for(var i = 0; i < this.commonErrors.length; i++){
			var commonError = this.commonErrors[i];
			var validation = commonError.isValid(variables, this.names, i);
			output.error = output.error || validation.error;
			if(validation.error) {
				output.messages = output.messages.concat(validation.messages);
			}
		}
		return output;
	}

	_validateCorrectValues(variables ) {
		var output = {error: false, messages: []};
		for(var i = 0; i < this.correctValues.length; i++){
			var correctValue = this.correctValues[i];
			for(var j = 0; j < this.names.length; j++) {
				var answerName = this.names[j];
				var validation = ExpressionEvaluator.isEvaluable(correctValue[answerName], variables);
				output.error = output.error || validation.error;
				if(validation.error) {
					output.messages = output.messages.concat({route: `correctValues.${i}.${answerName}`, message: validation.message});
				}
			}
		}
		return output;
	}

	generateCode() {
		var codeText = [];
		for(var i = 0; i < this.correctValues.length; i++) {
			var assertCode = this.names.map((name) => (this.correctValues[i][name] != "" && this.correctValues[i][name] != null && (typeof this.correctValues[i][name] !== "undefined"))  ? `math.eval("(${this.correctValues[i][name]})", Variables).toFixed(${this.precision}) == inputValue['${name}']` : `(inputValue['${name}'] == "" || inputValue['${name}'] == null)` );
			if(i == 0) {
				codeText.push(`if(${assertCode.join(' && ')}) {`);
			} else {
				codeText.push(`else if(${assertCode.join(' && ')}) {`);
			}
			codeText.push(`console.log("You did it!");`);
			codeText.push(`response = 'Correcto';`);
			codeText.push(`answerError = false;`);

			codeText.push(`}`);
		}
		for(var i = 0; i < this.commonErrors.length; i++) {
			var commonError = this.commonErrors[i];
			var failCode = this.names.map((name) => (commonError.values[name] != "" && commonError.values[name] != null && (typeof commonError.values[name] !== "undefined") ) ? `math.eval("(${commonError.values[name]})", Variables).toFixed(${this.precision}) == inputValue['${name}']` : `(inputValue['${name}'] == "" || inputValue['${name}'] == null)`);
			codeText.push(`else if (${failCode.join(" && ")}) {`);
			codeText.push(`console.log("You fail, ${commonError.message}");`);
			codeText.push(`response = '${commonError.message}';`);
			codeText.push(`error = true;`);
			codeText.push(`console.log("You fail, ${commonError.message}");`);
			codeText.push("}");

		}
		codeText.push(`else {`);
		codeText.push(`response = "Incorrecto!";`);
		codeText.push(`answerError = true;`);
		codeText.push("}");
		return this.code = codeText;
	}

	static createFromResponse(jsonAnswer) {
		var answer = new Answer();
		answer.names = jsonAnswer.names || [];
		answer.code = jsonAnswer.code;
		answer.correctValues = jsonAnswer.correctValues || [];
		answer.showLabel = jsonAnswer.showLabel;
		answer.precision = jsonAnswer.precision || 0;
		answer._id = jsonAnswer._id;
		answer.commonErrors = jsonAnswer.commonErrors.map(commonErrorJson => CommonError.createFromResponse(commonErrorJson));
		return answer;
	}

	static validateAnswer(jsonAnswer, variableText) {
			var answer = Answer.createFromResponse(jsonAnswer);
			var validationOutput = VariableParser.validate(variableText);
			if(validationOutput.errors.length == 0) {
				var variables = validationOutput.variables;
				validationOutput = answer.isValid(validationOutput.variables);
				return {
					ok: !validationOutput.error,
					errors: validationOutput.messages,
				};
			} else {
				return {
					ok: false,
					errors: "Error al validar las variables",
				};
			}
	}
}

module.exports = Answer;
