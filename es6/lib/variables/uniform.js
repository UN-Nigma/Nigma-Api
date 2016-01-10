const Variable = require('./variable');
const ExpressionEvaluator = require('./expression-evaluator');

class Uniform extends Variable {

  checkSyntax(currentVariables) {
    var match = this.codeFragment.match(this.syntax());
    var emptyParameters = false;
    if(match){
      emptyParameters = [match[3].trim(), match[4].trim(), match[5].trim()].some(element  => element == '');
    }
    if(match && emptyParameters){
      return {
        error: true,
        message: 'Sintaxis es incorrecta. Alguno de los parametros están vacios',
      };
    } else if (match && !this.validName(currentVariables, match[1])) {
      return {
        error: true,
        message: `Variable ${match[1]} ya está definida`,
      };
    } else if (!match){
      return {
        error: true,
        message: 'Sintáxis incorrecta de variable uniforme. la sintáxis correcta _x = U[min; max; step]',
      };
    } else {
      this.valid = true;
      return {
        error: false,
        message: null,
      }
    }
  }

  parseCode() {
    var match = this.codeFragment.match(this.syntax());
    this.parameters = {
      min: match[3].trim(),
      max: match[4].trim(),
      step: match[5].trim(),
    }
    this.name = match[1];
  }



  generateCode(currentVariables) {
    this.parseCode();
    this.code = `${Variable.replaceVariables(this.name)} = ${Variable.replaceVariables(this.parameters.min)} + Math.floor(((${Variable.replaceVariables(this.parameters.max)} - ${Variable.replaceVariables(this.parameters.min)}) * Math.random()/${Variable.replaceVariables(this.parameters.step)})) * ${Variable.replaceVariables(this.parameters.step)};`
    return this.code;
  }

  static identifier() {
    return 'U';
  }

  identifier() {
    return 'U';
  }

  getPossibleValue(variables) {
    if(this.possibleValue != null) {
      return this.possibleValue;
    }
    var min = ExpressionEvaluator.evaluate(this.parameters.min, variables).possibleValue;
    var max = ExpressionEvaluator.evaluate(this.parameters.max, variables).possibleValue;
    var step = ExpressionEvaluator.evaluate(this.parameters.step, variables).possibleValue;
    var output = min + Math.floor(((max - min) * Math.random() / step)) * step;
    return this.possibleValue = output;
  }

  syntax() {
    return /(\_[a-zA-Z])\s*=\s*(u|U)\[([^\,]+)\,([^\,]+)\,([^\]]+)\]/;
  }

  static createSkeleton() {
    return "_U = U[min, max, paso]";
  }

}

module.exports = Uniform;
