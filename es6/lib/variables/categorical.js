var Specific = require('./specific');
class Categorical extends Specific {

  checkSyntax(currentVariables) {
    let regex = this.syntax();
    var match = this.codeFragment.match(regex);
    var elementsFilled = true;
    if(match){
      var elements = match[3].split(',');
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
        message: "Sintaxis incorrecta para las variables categoricas. La sintáxis usada es _x = C{'texto 1', 'texto 2', ... , 'texto n'}"
      };
    } else {
      this.valid = true;
      return {
        error: false,
        message: null
      }
    }
  }

  static identifier() {
    return 'C';
  }

  identifier() {
    return 'C';
  }
  syntax() {
    return /(\_[a-zA-Z])\s*=\s*(c|C)\{([^\}]+)\}/;
  }

  getPossibleValue(variables) {
    var random = Math.floor(Math.random() * this.parameters.elements.length)
    return this.parameters.elements[random];
  }

  static createSkeleton() {
    return "_C = C{'texto 1', 'texto 2'}";
  }

}

module.exports = Categorical;
