const Variable = require('./variable');
const ExpressionEvaluator = require('./expression-evaluator');

class Specific extends Variable {

  checkSyntax(currentVariables) {
    let regex = this.syntax();
    let match = this.codeFragment.match(regex);

    let elementsFilled = true;
    if(match){
      let elements = match[3].split(',');
      elementsFilled = elements.every(element => element.trim() != '');
    }

    if(match && !elementsFilled){
      return {
        error: true,
        message: 'Sintáxis incorrecta. Alguno de los parametros están vacios'
      };
    } else if (match && !this.validName(currentVariables, match[1])) {
      return {
        error: true,
        message: `La variable ${match[1]} ya está definida`,
      };
    } else if (!match){
      return {
        error: true,
        message: 'Sintáxis incorrecta para las variables específicas. La sintáxis utilizada es _x = E{exp1, exp2,..., expn}'
      };
    } else {
      this.valid = true;
      return {
        error: false,
        message: null
      }
    }
  }

  parseCode() {
    let match = this.codeFragment.match(this.syntax());
    let elements = match[3].split(',');
    elements = elements.map(element => element.trim());
    this.parameters = {
      elements: elements
    }
    this.name = match[1]
  }

  generateCode(currentVariables) {
    this.parseCode();
    let vector = this.parameters.elements.map((element) => Variable.replaceVariables(element));
    let vectorName = `_vector_${this.name}`;
    let randomName = `_random_${this.name}`;

    let code = [
      `var ${vectorName} = [${vector}]`,
      `var ${randomName} = Math.floor((Math.random() * ${vector.length}))`,
      `${Variable.replaceVariables(this.name)} = ${vectorName}[${randomName}]`
    ]
    this.code = `${code.join(";")};`;
    return this.code; 
  }

  static identifier() {
    return 'E';
  }

  identifier() {
    return 'E';
  }

  syntax() {
    return /(\_[a-zA-Z])\s*=\s*(e|E)\{([^\}]+)\}/;
  }

  getPossibleValue(variables) {
    if(this.possibleValue != null) {
      return this.possibleValue;
    }
    var random = Math.floor(Math.random() * this.parameters.elements.length)
    var output = ExpressionEvaluator.evaluate(this.parameters.elements[random], variables);
    return this.possibleValue = output.possibleValue;
  }

  static createSkeleton() {
    return "_E = E{numero 1, numero 2}";
  }

}

module.exports = Specific;
