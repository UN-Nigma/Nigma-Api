
class Variable {
  constructor(codeFragment) {
    this.codeFragment = codeFragment;
    this.name = "";
    this.parameters = {};
    this.code = "";
    this.possibleValue = null;
    this.valid = false;
  }

  validName(currentVariables, name) {
  	return !(currentVariables.indexOf(name) != -1);
  }


  static replaceVariables(codeText) {
    if(typeof codeText  === "undefined")
      return "";
    codeText = codeText || "";
    if(codeText != null) {
      codeText = codeText.toString();
    }
    if(codeText != null && codeText != "" && codeText.match(/(\_[A-Za-z])/g))
      codeText = codeText.replace(/(\_[A-Za-z])/g, `Variables['$1']`);
    return codeText;
  }

  static retrieveEvaluableVariables(variables) {
    var evaluableVariables = {}
    for (var i = variables.length - 1; i >= 0; i--) {
      var variable = variables[i];
      if (variable.identifier() == 'U' || variable.identifier() == 'E') {
        evaluableVariables[variable.name] = variable;
      }
    }
    return evaluableVariables;
  }
}

module.exports = Variable;