//Data Sctructures
const Variable = require('./variable');
const math = require('mathjs');
module.exports = {
	evaluate(expression, variables) {
    var output = {
      error: false,
      possibleValue: null,
      messages: []
    }
    try {
      var scope = {};
      for(var key  in variables) {
        if(variables.hasOwnProperty(key)){
          var variable = variables[key];
          scope[variable.name] = variable.possibleValue;
        }
      }

      var evalValue = math.eval(expression, scope)
      if(isNaN(evalValue)){
        throw new Error("La expresión no es evaluable");
      } else {
        output.possibleValue = evalValue;
      }
    } catch(exception) {
      output.error = true;
      if(exception.message != "La expresión no es evaluable")
        output.messages.push("La expresión no está bien formada");
      else
        output.messages.push(exception.message);
    }
    return output;

  },

  isEvaluable(expression, variables) {

    if(expression == null || expression == ""){
      return {error: false, messages: []};
    }
    expression = expression.toString();
    var evaluableVariables = Variable.retrieveEvaluableVariables(variables);
    var match = expression.match(/\_[A-Za-z]/g) || [];
    var compoundOfEvaluable = match.every((varName) => evaluableVariables[varName] != null);
    if (compoundOfEvaluable) {
      var output = this.evaluate(expression, evaluableVariables);
      return output;
    } else {
      return {
        error: true,
        messages: ["La expresión puede contener variables no definidas o no evaluables"]
      }
    }
  }
};