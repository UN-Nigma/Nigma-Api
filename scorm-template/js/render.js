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
    text = text.replace(/\<img\s+alt\=\"([^\"]+)\"\s+.*?(class=\"latex\")[^>]*>/g, function(math, latex, className) {
      return "$"+latex+"$";
    });

    text = text.replace(/\@\{([^}]+)\}/g, function(match, expression) {
      return math.eval(expression, Variables);
    });
    text = text.replace(/_[a-zA-Z]/g, function(match) {
      if(Variables[match] == null) {
        return match;
      } else {
        return Variables[match];
      }
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
      });

      var feedback = "";
      var answerError = true;
      var code = Question.answer.code.join("");
      eval(code);
      if(answerError) {
        setScore(0);
        ScormProcessSetValue("cmi.comments_from_lms", feedback);
        ScormProcessSetValue("cmi.core.lesson_status", "failed");
        ScormProcessFinish();
      } else {
        setScore(1);
        ScormProcessSetValue("cmi.comments_from_lms", feedback);
        ScormProcessSetValue("cmi.core.lesson_status", "passed");
        ScormProcessFinish();
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
      eval(Question.answer.code.join("\n"));
      var feedBack = [];
      if(answerError) {
        setScore(0);
        ScormProcessSetValue("cmi.comments_from_lms", feedback.join("\n"));
        ScormProcessSetValue("cmi.core.lesson_status", "failed");
        ScormProcessFinish();
      } else {
        setScore(1);
        ScormProcessSetValue("cmi.comments_from_lms", "");
        ScormProcessSetValue("cmi.core.lesson_status", "passed");
        ScormProcessFinish();
      }
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

