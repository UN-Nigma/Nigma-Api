var question = {
  "answers": [
    {
      "name": "Área",
      "correctValue": "_a * _b",
      "showLabel": true,
      "precision": 2,
      "commonErrors": [
        {
          "value": "_b - _a",
          "message": "Para calcular el tiempo entre dos primero es el tiempo de fin - tiempo inicio"
        },
        {
          "value": "_a * _a",
          "message": "Recordar tal formula"
        }
      ],
      "_id": 1,
      "code": [
        "var correctValue = Variable[\"_a\"] * Variable[\"_b\"];",
        "switch(inputValue){",
        "case correctValue:",
        "console.log(\"You did it!\");",
        "break;",
        "case Variable[\"_b\"] - Variable[\"_a\"]:",
        "console.log(\"You fail, Para calcular el tiempo entre dos primero es el tiempo de fin - tiempo inicio\");",
        "break;",
        "case Variable[\"_a\"] * Variable[\"_a\"]:",
        "console.log(\"You fail, Recordar tal formula\");",
        "break;",
        "}"
      ]
    },
    {
      "name": "Perimetro",
      "correctValue": "_a * 2 + 2 * _b",
      "showLabel": false,
      "precision": 3,
      "commonErrors": [
        {
          "value": "_b - _a",
          "message": "Para calcular el tiempo entre dos primero es el tiempo de fin - tiempo inicio"
        },
        {
          "value": "_b / _a",
          "message": "Recordar tal formula"
        }
      ],
      "_id": 2,
      "code": [
        "var correctValue = Variable[\"_a\"] * 2 + 2 * Variable[\"_b\"];",
        "switch(inputValue){",
        "case correctValue:",
        "console.log(\"You did it!\");",
        "break;",
        "case Variable[\"_b\"] - Variable[\"_a\"]:",
        "console.log(\"You fail, Para calcular el tiempo entre dos primero es el tiempo de fin - tiempo inicio\");",
        "break;",
        "case Variable[\"_b\"] / Variable[\"_a\"]:",
        "console.log(\"You fail, Recordar tal formula\");",
        "break;",
        "}"
      ]
    }
  ],
  "variables": {
    "text": "_a = U[1, 20, 1]\n_b = E{1, 2,3, 4,5,6,7,2}\n",
    "variables": [
      {
        "codeFragment": "_a = U[1, 20, 1]",
        "name": "_a",
        "parameters": {
          "min": "1",
          "max": "20",
          "step": "1"
        },
        "code": "Variables['_a'] = 1 + Math.floor(((20 - 1) * Math.random()/1)) * 1;",
        "possibleValue": null
      },
      {
        "codeFragment": "_b = E{1, 2,3, 4,5,6,7,2}",
        "name": "_b",
        "parameters": {
          "elements": [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "2"
          ]
        },
        "code": "var _vector__b = [1,2,3,4,5,6,7,2];var _random__b = Math.floor((Math.random() * 8));Variables['_b'] = _vector__b[_random__b];",
        "possibleValue": null
      }
    ]
  },
  "formulation" : "lalalalalalallalalalal<b>lalalal</b>"
}