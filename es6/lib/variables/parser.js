//Variable Models
const Uniform = require('./uniform');
const Specific = require('./specific');
const Categorical = require('./categorical');
const Variable = require('./variable');

var VariableParser = {
  _detectType(nigmaCode) {
    var regex = /(\_[a-zA-Z])\s*=\s*(u|e|c|U|E|C)(\[|\{)/
    var match = nigmaCode.match(regex)
    if(match){
      var type;
      switch (match[2].toUpperCase()) {
        case Uniform.identifier():
          type =  Uniform
          break;
        case Specific.identifier():
          type =  Specific
          break;
        case Categorical.identifier():
          type =  Categorical
          break;
      }
      return {
        error: false,
        message: null,
        type: type
      }

    } else {
      return {
        error: true,
        message: "El tipo de la variable no puede ser determinado. Uniforme: $x = U[min; max; step], Especifica: $x = E{exp1, exp2,..., expn}, Categorica: $x = C{'text 1', 'text 2', ... , 'text 3'}",
        type: null
      }
    }
  },

  /*
    Está función recibe el código en lenguaje controlado
    Retorna los errores y las variables generadas.
  */
  checkCode(nigmaCode) {
    var errors =  [], variables =  [];
    for(var j = 0; j < nigmaCode.length; j++){
      var codeFragment = nigmaCode[j];
      var variableType = this._detectType(codeFragment);
      if(variableType.error){
        errors.push(`Error en la linea ${j + 1}: ${variableType.message}`);
        break;
      } else {
        var variable = new variableType.type(codeFragment);
        var usedVariablesNames = variables.map(variable => variable.name);
        var validationOutput = variable.checkSyntax(usedVariablesNames);
        if (validationOutput.error) {
          errors.push(`Error en la linea ${j + 1}: ${validationOutput.message}`);
          break;
        } else {
          variables.push(variable);
        }
      }
    }
    return {
      errors: errors,
      variables: variables
    };
  },

  /*
    Esta función recibe objetos del tipo Variable, genera y ejecuta su código
  */
  executeCode(variables) {
    var Variables = {}
    var output = {
      errors: [],
      result: {},
      variables: variables
    };
    var javascriptCode = variables.map(variable => variable.generateCode());
    for(var i = 0; i < javascriptCode.length; i++){
      try{
        var jCode = javascriptCode[i];
        eval(jCode);
        variables[i].possibleValue = Variables[variables[i].name];
      } catch(exception) {
        output.errors.push(`Error en la linea ${i + 1}: ${exception.message}`);
        break;
      }
    }
    if(output.errors.length == 0){
      output.result = Variables;
    }
    return output;
  },

  _validateAll(nigmaCode) {
    var validationOutput = this.checkCode(nigmaCode.split('\n').filter(variable => variable != ''));
    if(validationOutput.errors == null || validationOutput.errors.length != 0) {
      return validationOutput;
    } else {
      validationOutput = this.executeCode(validationOutput.variables);
      return validationOutput;
    }
  },

  validate(variableText) {
    var validationOutput = this._validateAll(variableText);
    if(validationOutput.errors.length == 0) {
      return {
        ok: true,
        variables: validationOutput.variables,
        values: validationOutput.results,
        errors: []
      };  
    } else {
      return {
        ok: false,
        errors: validationOutput.errors,
        variables: null,
        values: null,
      };
    }
  }
}

module.exports = VariableParser;
