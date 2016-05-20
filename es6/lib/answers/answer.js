const CommonError = require('./common-error');
const ExpressionEvaluator = require('../variables/expression-evaluator');
const Variable = require('../variables/variable');
const uniqid = require('uniqid');
const VariableParser = require('../variables/parser');
class Answer {
	constructor(type = "Complete") {
		this.correctValues = [];
		this.commonErrors = [];
		this._id = uniqid();
		this.code = null;
		if(type == "Complete"){
			this.names = [];
			this.showLabel = true;
			this.precision = 0;
		} else if(type == "MultipleSelection") {
			this.wrongValues = [];
		}
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
		} else if(type == "MultipleSelection") {
			return {error: false, messages: {commonErrors: [], correctValues: [], wrongValues: []}}
			var isOk = true;
			/*var match = expression.match(/\_[A-Za-z]/g) || [];
    	var compoundOfEvaluable = match.every((varName) => evaluableVariables[varName] != null);*/
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

	_generateCodeComplete() {
		var codeText = [];
		for(var i = 0; i < this.correctValues.length; i++) {
			var assertCode = this.names.map((name) => (this.correctValues[i][name] != "" && this.correctValues[i][name] != null && (typeof this.correctValues[i][name] !== "undefined"))  ? `math.eval("(${this.correctValues[i][name]})", Variables).toFixed(${this.precision}) == inputValue['${name}']` : `(inputValue['${name}'] == "" || inputValue['${name}'] == null)` );
			if(i == 0) {
				codeText.push(`if(${assertCode.join(' && ')}) {`);
			} else {
				codeText.push(`else if(${assertCode.join(' && ')}) {`);
			}
			codeText.push(`console.log("You did it!");`);
			codeText.push(`feedback = '';`);
			codeText.push(`answerError = false;`);

			codeText.push(`}`);
		}
		for(var i = 0; i < this.commonErrors.length; i++) {
			var commonError = this.commonErrors[i];
			var failCode = this.names.map((name) => (commonError.values[name] != "" && commonError.values[name] != null && (typeof commonError.values[name] !== "undefined") ) ? `math.eval("(${commonError.values[name]})", Variables).toFixed(${this.precision}) == inputValue['${name}']` : `(inputValue['${name}'] == "" || inputValue['${name}'] == null)`);
			codeText.push(`else if (${failCode.join(" && ")}) {`);
			codeText.push(`console.log("You fail, ${commonError.message}");`);
			codeText.push(`feedback = '${commonError.message}';`);
			codeText.push(`answerError = true;`);
			codeText.push(`console.log("You fail, ${commonError.message}");`);
			codeText.push("}");

		}
		codeText.push(`else {`);
		codeText.push(`feedback = '';`);
		codeText.push(`answerError = true;`);
		codeText.push("}");
		return codeText;
	}

	_generateCodeMultipleSelection() {
		var codeText = [];
		//Correct
		codeText.push(`
			var isCorrect = false;
			if(inputValues.length == correctValues.length && correctValues.length > 0) {
				inputValues.sort();
				correctValues.sort();
				isCorrect = true;
				for (var i = correctValues.length - 1; i >= 0 && isCorrect; i--) {
					isCorrect	= (isCorrect && (correctValues[i] == inputValues[i]));
				}
			}
		`);
		codeText.push(`
			var map = mapMultipleData.commonErrors;
			inputValues.forEach(function(value) {
				if(commonErrors.indexOf(value) != -1)
					feedBack.push(Question.answer.commonErrors[map[value]].message)
			});

		`)

		codeText.push(`
			if(isCorrect) {
				console.log("You are ok");
				answerError = false;
			}
		`);
		codeText.push(`
			else if(feedBack.length > 0) {
				console.log("You are wrong + hasFeedback");
				answerError = true;
			}
		`);
		codeText.push(`
			else {
				console.log("You are wrong");
				answerError = true;
			}
		`);
		return codeText;
	}

	generateCode(type = "Complete") {
		if(type == "Complete")
			return this._generateCodeComplete();
		else if(type == "MultipleSelection") {
			return this._generateCodeMultipleSelection();
		}
	}

	static createFromResponse(jsonAnswer, questionType = "Complete") {

		var answer = new Answer(questionType);
		answer.names = jsonAnswer.names || [];
		answer.code = jsonAnswer.code;
		answer.correctValues = jsonAnswer.correctValues || [];
		if(questionType == "Complete") {
			answer.showLabel = jsonAnswer.showLabel;
			answer.precision = jsonAnswer.precision || 0;
			answer._id = jsonAnswer._id;
			answer.commonErrors = jsonAnswer.commonErrors.map(commonErrorJson => CommonError.createFromResponse(commonErrorJson));
		} else if(questionType == "MultipleSelection") {
			answer.commonErrors = jsonAnswer.commonErrors || [];
			answer.wrongValues = jsonAnswer.wrongValues || [];
		}
		return answer;
	}

	static validateAnswer(jsonAnswer, variableText, questionType = "Complete", generateCode = false) {
			var answer = Answer.createFromResponse(jsonAnswer,questionType );
			var validationOutput = VariableParser.validate(variableText);
			console.log(">>>>>>>>>>>>>>>>>>>>>>", questionType)
			if(validationOutput.errors.length == 0) {
				var variables = validationOutput.variables;
				validationOutput = answer.isValid(variables, questionType);
				if(generateCode && !validationOutput.error)
					answer.code = answer.generateCode(questionType);
				return {
					ok: !validationOutput.error,
					errors: validationOutput.messages,
					answer: answer,
					variables: variables,
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
