var randomUtils = {

  //call some function for gen random depend of type of the var
  genRandom: function (variable) {
    if (variable.tipo == "especifica" || variable.tipo == "categorica") {
      return variable.valor[this.getRandomInt(0, variable.valor.length)];
    } else if (variable.tipo == "uniforme") {
      var max = parseFloat(variable.fin - variable.inicio) / parseFloat(variable.cifras_decimales);
      return this.roundInc(this.getRandomInt(0, max), variable.cifras_decimales, variable.inicio, variable.fin);
    }
  },

  // Returns a random number between min (inclusive) and max (exclusive)
  getRandomArbitrary: function (min, max) {
    return Math.random() * max;
  },

  //Returns a random number limit betwen max and min and also an increment
  roundInc: function (num, inc, min, max) {

    var n = Math.abs(inc); // Change to positive
    var decimal = n - Math.floor(n);
    var cant = this.decimalPlaces(decimal);
    var mul = 1;

    for (var i = 1; i <= cant; i++) {
      mul *= 10;
    }
    return Math.round(parseFloat(min + inc * num) * mul) / mul;

  },

  // Returns a random integer between min (inclusive) and max (inclusive). Using Math.round() will give you a non-uniform distribution!
  getRandomInt: function (min, max) {
    return Math.floor(Math.random() * max);
  },

  //Return the cant of decimal places in a decimal number
  decimalPlaces: function (num) {
    var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) {
      return 0;
    }
    return Math.max(
      0,
      // Number of digits right of decimal point.
      (match[1] ? match[1].length : 0)
        // Adjust for scientific notation.
      - (match[2] ? +match[2] : 0));
  }
};