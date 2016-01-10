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

	//response for modal
	alertModal: function(name, clase, solution) {
		return '<div class="alert ' + clase + '  col-xs-12"><label>' + name + ':&nbsp; </label>'+ solution +'</div>';
	}

};

window.Printer = window.Printer || Printer;