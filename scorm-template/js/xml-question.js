var question = {"_id":"56bbf562722123420b200719","created_at":"2016-02-11T02:43:46.057Z","updated_at":"2016-03-31T12:04:27.948Z","name":"Pregunta de selección multiple","owner":{"_id":"56bbcb8c45a0cf2f5404fe46","email":"nickforspeed25@gmail.com","name":"Alex","root_folder":"56bbcb8c45a0cf2f5404fe44","root_shared_folder":"56bbcb8c45a0cf2f5404fe45","photo":{"public_url":"http://dummyimage.com/100x100/ffffff/4EAD3E&text=A"}},"parent_folder":"56bbcc0c45a0cf2f5404fe48","variables":{"text":"_a = U[0, 4, 1]\n_b = E{_a, _a + 2, _a + 3}\n_c = C{\"Soto\"}","variables":[{"codeFragment":"_a = U[0, 4, 1]","name":"_a","parameters":{"min":"0","max":"4","step":"1"},"code":"Variables['_a'] = 0 + Math.floor(((4 - 0) * Math.random()/1)) * 1;","possibleValue":2,"valid":true},{"codeFragment":"_b = E{_a, _a + 2, _a + 3}","name":"_b","parameters":{"elements":["_a","_a + 2","_a + 3"]},"code":"var _vector__b = [Variables['_a'],Variables['_a'] + 2,Variables['_a'] + 3];var _random__b = Math.floor((Math.random() * 3));Variables['_b'] = _vector__b[_random__b];","possibleValue":4,"valid":true},{"codeFragment":"_c = C{\"Soto\"}","name":"_c","parameters":{"elements":["\"Soto\""]},"code":"var _vector__c = [\"Soto\"];var _random__c = Math.floor((Math.random() * 1));Variables['_c'] = _vector__c[_random__c];","possibleValue":"Soto","valid":true}]},"answer":{"correctValues":["<p>@{((_a+3)*(_a+3)/2) - ((_a)*(_a)/2)}</p>","<p><img alt=\"\\int \\frac{2}{3} dx\" data-cke-saved-src=\"http://latex.codecogs.com/gif.latex?%5Cint%20%5Cfrac%7B2%7D%7B3%7D%20dx\" src=\"http://latex.codecogs.com/gif.latex?%5Cint%20%5Cfrac%7B2%7D%7B3%7D%20dx\" class=\"latex\">​ _b</p>","<p>Nuevo</p>"],"commonErrors":[{"value":"<p><img alt=\"\\frac{_a}{2}\" src=\"http://latex.codecogs.com/gif.latex?%5Cfrac%7B_a%7D%7B2%7D\" class=\"latex\">​<br></p>","message":"Esté es el triple..."},{"value":"@{_a*4}","message":"Este es cuadruple..."}],"_id":"img8z279","code":["\n\t\t\tvar isCorrect = false;\n\t\t\tif(inputValues.length == correctValues.length && correctValues.length > 0) {\n\t\t\t\tinputValues.sort();\n\t\t\t\tcorrectValues.sort();\n\t\t\t\tisCorrect = true;\n\t\t\t\tfor (var i = correctValues.length - 1; i >= 0 && isCorrect; i--) {\n\t\t\t\t\tisCorrect\t= (isCorrect && (correctValues[i] == inputValues[i]));\n\t\t\t\t}\n\t\t\t}\n\t\t","\n\t\t\tvar feedBack = [];\n\t\t\tvar map = mapMultipleData.commonErrors;\n\t\t\tinputValues.forEach(function(value) {\n\t\t\t\tif(commonErrors.indexOf(value) != -1)\n\t\t\t\t\tfeedBack.push(Question.answer.commonErrors[map[value]].message)\n\t\t\t});\n\n\t\t","\n\t\t\tif(isCorrect) {\n\t\t\t\tconsole.log(\"You are ok\");\n\t\t\t\tanswerError = false;\n\t\t\t\talert(\"Good\");\n\t\t\t}\n\t\t","\n\t\t\telse if(feedBack.length > 0) {\n\t\t\t\tconsole.log(\"You are wrong + hasFeedback\");\n\t\t\t\talert(\"hasFeedback: \" + feedBack.join(String.fromCharCode(10)));\n\t\t\t\tanswerError = true;\n\t\t\t}\n\t\t","\n\t\t\telse {\n\t\t\t\tconsole.log(\"You are wrong\");\n\t\t\t\talert(\"You are wrong\");\n\t\t\t\tanswerError = true;\n\t\t\t}\n\t\t"],"wrongValues":["<p>@{_a} s</p>","<p><img alt=\"\\sin _a\" src=\"http://latex.codecogs.com/gif.latex?%5Csin%20_a\" class=\"latex\">​<br></p>","@{_a*3+1}"],"names":[]},"formulation":"<p>Cuál es el resultado de la integral?​&nbsp;<img alt=\"\\int_{_a}^{@{_a+3}} x dx\" class=\"latex\" data-cke-saved-src=\"http://latex.codecogs.com/gif.latex?%5Cint_%7B_a%7D%5E%7B@%7B_a&amp;plus;3%7D%7D%20x%20dx\" src=\"http://latex.codecogs.com/gif.latex?%5Cint_%7B_a%7D%5E%7B@%7B_a&amp;plus;3%7D%7D%20x%20dx\"><img data-cke-saved-src=\"http://localhost:4000/static/56bbf562722123420b200719/images/80c8d7f2c930a62c810c1c8e5bd3149d\" src=\"http://localhost:4000/static/56bbf562722123420b200719/images/80c8d7f2c930a62c810c1c8e5bd3149d\" width=\"221\" height=\"126\"></p>","metadata":{"publisher":"Nose","title":"Multiple selection","description":"Test de Selección multiple con integrales y CKEditor","keywords":"Data","coverage":"Ed. Superior","autor":"Alex","editor":null,"date":"2016-02-11T02:43:46.057Z","language":"Español"},"deleted":false,"images":[],"users":[],"type":"MultipleSelection","preview":true}; window.question = window.question || question;