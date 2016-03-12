var Printer = {

	generateInput: function(name, id, showLabel) {
		var cssClass = "input-group";
		if(!showLabel)
			cssClass = "form-group";
		var generatedHTML =  "<div class='"+ (cssClass)  +"'>";
		if(showLabel){
			generatedHTML += "<span class='input-group-addon' id='ba'>"+ name +"</span>";
		}
		generatedHTML += 	"<input class='form-control response' aria-describedby='ba' type='number' id='"+ id +"'>";
		generatedHTML += "</div>";
		return generatedHTML;
	},

	generateMultipleInput: function(question) {
		var answer = question.answer;
		var mapCorrect = {};
		var mapCommonError  = {};
		var mapError = {};
		var used = {};

		var auxMap;
		var messages = {}
		var eachFunction = function(value, index) {
			var x = Math.floor(Math.random() * 1000000000);
			while(used[x] != null) 
				x = Math.floor(Math.random() * 1000000000)
			used[x] = true;
			auxMap[x] = index;
			if(typeof value == "string") {
				messages[x] = value;
			} else {
				messages[x] = value.value;
			}
		};
		console.log(answer)
		auxMap = mapCorrect;
		answer.correctValues = answer.correctValues || [];
		answer.correctValues.forEach(eachFunction);
		auxMap = mapCommonError;
		answer.commonErrors.forEach(eachFunction);
		auxMap = mapError;
		answer.wrongValues = answer.wrongValues || [];
		answer.wrongValues.forEach(eachFunction);

		var type = "radio";
		if (answer.correctValues.length > 1)
			type = "checkbox"
		var html = [];
		for(id in messages) {
			var message = messages[id];
			html.push(
				'<div class="'+ type +'"> \
					<label> \
						<input type="'+ type +'" name="options" value="' + id + '"/>\
						'+ message +' \
					</label> \
				</div>'
			);
		}
		return {
			html: html.join("\n"),
			maps: {
				correctValues: mapCorrect,
				commonErrors: mapCommonError,
				wrongValues: mapError
			}
		}
	},
	//response for modal
	alertModal: function(name, clase, solution) {
		return '<div class="alert ' + clase + '  col-xs-12"><label>' + name + ':&nbsp; </label>'+ solution +'</div>';
	},


};

window.Printer = window.Printer || Printer;