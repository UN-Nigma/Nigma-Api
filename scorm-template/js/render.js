$(document).on("ready", render);

//this should get data of the API

//Static Variables
var Question = window.question;

//var Errors 	    = Answer.error_genuino;
var RandomUtils = window.randomUtils;
//var Responses = Question.respuestas.respuesta;
var Printer = window.Printer;
var Variables = {};
var Variable = {};
var DecodeText = {"&amp;&amp;#35;40;": "(", "&amp;&amp;#35;41;": ")"};

var correctAnswer = true;
var correctResponses = 0;

var mapMultipleData = {

}

//Event Emmiter
function render() {
  //Default content
  Render.loadVariables();
  var parsedFormulation = Render.parseString(Question.formulation);
  $('.statement').html(parsedFormulation);
  Render.loadInputsResponse();

  //Event Click
  $("#sendData").on("click", Render.evalueteData);
  //Press Enter
  $('body').on('keydown', '#inputData', function (event) {
    if (event.keyCode == 13) {
      Render.evalueteData();
    }
  });
}

//Object Render
var Render = {

  //get Texts and Formulas
  parseString: function (text) {
     ///La idea de esta fucnión es cargar toda la formulación tal y como el profesor la programó haciedo uso del objeto
     // Question que tiene toda la data en formato JSON de la pregunta (Formulación, variables y respuestas), aquí se deben cargar las formulas,
     // expresiones, texto, etc con el valor de las variables correspondiente despues de generar los numeros aleatorios y además ejecutar las operaciones
     // entre ellas(En el caso que se deba ejecutar la operacion).
     // El lugar donde se imprimirá toda la formulación tiene la clase .statement y lo pueden encontrar en launch.html
     var expresionsInQuestion = [];   // @(_q + _b)
     for (var i = 0; i < text.length; i++) {
      var token = text[i];
      if(token == '_'){
      var str = text.substring(i,i+2);
      text =  text.replace(new RegExp(str,"g"),Variables[text.substring(i,i+2)]);
      }
      if(token == '@'){
        var initialIndex = {'index':i};
      } else if(token == '}' && initialIndex){
        var finalIndex = {'index':i};
        expresionsInQuestion.push({
          'expresion':String(text).substring(initialIndex.index+2,finalIndex.index),
          'completeExpresion': String(text).substring(initialIndex.index,finalIndex.index+1),
          'initial':initialIndex.index,
          'final':finalIndex.index
        });
      }
    }
    expresionsInQuestion.map((expresion,index)=>{
      var newValor = math.eval(expresion.expresion);
      text = text.replace(expresion.completeExpresion,newValor);
    });
    
    return text;

  },

  //load html inputs for type the response and next evaluate this
  loadInputsResponse: function () {
    if(Question.type == "Complete")
      Question.answer.names.forEach(function(answerName, index){
        var answerHtml = Printer.generateInput(answerName, answerName, Question.answer.showLabel);
        $('#inputResponses').append(answerHtml);
      })
    else if(Question.type == "MultipleSelection"){
      var res = Printer.generateMultipleInput(Question);
      $('#inputResponses').html(this.parseString(res.html));
      mapMultipleData = res.maps;
      console.log(mapMultipleData);
    }
  },

  evalueteData: function () {
    if(Question.type == "Complete") {
      var inputValue = {};
      $('.response').each(function () {
        var input = $(this);
        console.log(input.val());
        if(input.val() == "" || input.val() == null )
          inputValue[input.attr('id')]
        else
          inputValue[input.attr('id')] = Number(Number(input.val()).toFixed(Question.answer.precision));
        console.log(inputValue);
      });

      var response = "";
      var answerError = true;
      var code = Question.answer.code.join("");
      eval(code);
      if(answerError) {
        alert(response);
      } else {
        alert(response)
      }
    } else if (Question.type == "MultipleSelection") {
      var inputs = $("input[name='options']:checked")
      var inputValues = $.map(inputs, function(input) {return input.getAttribute("value")});
      var mapIds = function(hash) {
        var ids = [];
        for(id in hash)
          ids.push(id);
        return ids;
      }
      var correctValues = mapIds(mapMultipleData.correctValues);
      var commonErrors = mapIds(mapMultipleData.commonErrors);
      eval(Question.answer.code.join("\n"))
    }
    
  },

  //Load and execute random functions for each var
  loadVariables: function () {
    Question.variables.variables.forEach(function(variable, index){
      eval(variable.code);
    });

    Variable = Variables;

  },

};

