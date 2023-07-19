console.log(">>> START");
var CurrentQA;
var AElement;
var BElement;
var Input;
var InputFind=false;
const debug = true;
const timeout = 0;

class ClassQA{ //КЛАСС объекта ВОПРОСА И ОТВЕТОВ
	answers;
	amount;
	constructor(question){
		this.Question = question;
		this.answers = [];
		this.amount=0;
	}
	ClearAnswers(){
		this.amount=0;
		this.answers.length=0;
	}	
	get Amount(){
		return this.amount;
	}
	get Question(){
		return this.question;
	}
	set Question(value){
		this.question = value;
	}
	get Answers(){
		return this.answers;
	}
	AddAnswer(answer){ //добавить ответ
		if (ClassQA.StringIsEmpty(answer,"ClassQA.AddAnswer(answer)")) return;
		this.amount=this.amount+1;
		this.answers[this.amount-1] = answer;
	}
	
	static StringIsEmpty(str,w="(нет данных)"){//Проверка на пустую строку (СТРОКА,ПРИМЕЧАНИЕ)
		if (str != null && typeof str !== "undefined") {
			str = str.trim();
		}
		if (!str) { 
			if(debug) console.log("Пустая строка! ошибка в "+ w);
			return true;
		}
		return false;
	}
}

function ClickScan(){//Сканирование страницы и выявление нужных обьектов
	console.log(">>> ClickScan >>>")
	AElement = document.getElementsByClassName('ant-typography'); //массив ВОПРОС, ОТВ1, ОТВ2
	BElement = document.getElementsByClassName('ant-card-body');
	if (debug){console.log("AElement: "); console.log(AElement); console.log("BElement"); console.log(BElement);};
}



document.body.addEventListener('mousedown', function () {//ЩЕЛЧЁК МЫШИ
	if (timeout>0){
		setTimeout(function() {
		if (debug){console.log("TimeoutEND");};
			ClickScan();
			GetInput();
			ParserPip();
		}, timeout);
	} else{
			ClickScan();
			GetInput();
			ParserPip();
	}	
}, false);


document.addEventListener('keyup', function(e) {//кнопка клавы была нажата
	if (timeout>0){
		setTimeout(function() {
		if (debug){console.log("TimeoutEND");};
			ClickScan();
			GetInput();
			ParserPip();
		}, timeout);
	} else{
			ClickScan();
			GetInput();
			ParserPip();
	}	
});


function GetInput(){//ЗАБИРАЕТ ЗНАЧЕНИЯ ИЗ ПОЛЯ ВВОДА
		var input = document.querySelector('input');
		//var input = document.getElementsByClassName('ant-input');
		if (input == null){
			Input=null;
			InputFind=false;
			return;
		}
		if (debug){console.log("input.value = "+input.value+"  input.class="+input.className); console.log(input);};
		Input = input.value;
		if (input.className=="ant-input custom-input") InputFind=true; else InputFind=false;
		if (debug){if (InputFind) {console.log("Найден импут");};};
}

function ParserPip(){//последовательность парсера
	if (PPWindowWithInputArea()) return;
	if (PPWindowWithButAnswer()) return;
}

function PPWindowWithInputArea(){//Детектор Окна с строчкой ввода
	if (AElement.length!=3) return false;
	if (BElement.length!=0) return false;
	if (!InputFind) return false;
	if (ClassQA.StringIsEmpty(Input,"PPWindowWithInputArea"))return false;
	if (debug) console.log(">>> PPWindowWithInputArea find");
}

function PPWindowWithButAnswer(){//Детектор Окна одним или несколькими правильным ответом
	if (AElement.length<5) return false;
	if (BElement.length<2) return false;
	if (InputFind) return false;
	if (debug) console.log(">>> PPWindowWithButAnswer find");
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//ТАК МОЖНО ВЫПОЛНИТЬ ЗАДЕРЖКУ ВЫПОЛНЕНИЯ (при выключении выполнения скриптов не действует)
/*
function Timeout(time){
	console.log("TimeoutSTART");
	setTimeout(function() {
		console.log("TimeoutEND");
	}, time);
}
*/
function Timeout(time){
	console.log("TimeoutSTART");
	setTimeout(TOfunction,time);
}
function TOfunction(){
	console.log("TimeoutEND");
}

function SaveDBOld(select){
	chrome.storage.local.set({ key: select }).then(() => {
	console.log("Value is set1");
	});
	chrome.storage.local.set({ goi: "Гои спасают мир!" }).then(() => {
	console.log("Value is set2");
	});
}

function LoadDBOld(){
	chrome.storage.local.get(["key","goi"]).then((result) => {
	console.log("Value currently is 1: " + result.key + " 2: " + result.goi);
	});
}

function GetVoprosOld(){
	console.log(">>> GetVopros")
	vop = document.getElementsByClassName('ant-typography'); //массив ВОПРОС, ОТВ1, ОТВ2
	otv = document.getElementsByClassName('ant-card-body');
	console.log(vop.length);
	console.log(vop);
	console.log(otv.length);
	console.log(otv);
	if (vop.length < 2) return;
	if (otv.length == 0) return;
	console.log(vop[1].innerText); //ВОПРОС
	for (var i=0;i < otv.length;i++){ //ответы
		console.log(otv[i].innerText + "   selected: " + otv[i].parentElement.className.indexOf("answer-selected"));
		otv[i].innerText = "[" + i + "]" + otv[i].innerText; //добавляем цифры к ответам
	}
}

function GetYesNoOld(){
	console.log(">>> GetYesNo")
	vop = document.getElementsByClassName('ant-typography');
	otv = document.getElementsByClassName('ant-card-body');
	console.log(vop.length);
	console.log(vop);
	console.log(otv.length);
	console.log(otv);
	if (vop.length != 3) return;
	if (otv.length != 0) return;
	//console.log(vop[0].innerText);
	if (vop[0].innerText == "Правильный ответ") {
		console.log("ОТВЕТ ВЕРНЫЙ")
	}
	if (vop[0].innerText == "Неправильный ответ") {
		console.log("ОТВЕТ НЕВЕРНЫЙ!!!")
	}
}


function GetVoprosOld2(){
	//vop = getElementsByClassName(document.body,'mb-2'); //массив ВОПРОС, ОТВ1, ОТВ2
	vop = document.getElementsByClassName('ant-card-body');
	console.log(vop.length);
	if (vop.length == 0) return;
	console.log(vop[0].innerText); //ВОПРОС
	for (var i=1;i < vop.length;i++){ //ответы
		console.log(vop[i].innerText);
		console.log(vop[i].getAttribute("data-answer-id")); //data-answer-id АТРИБУТ
		vop[i].innerText = "[" + i + "]" + vop[i].innerText; //добавляем цифры к ответам
	}
}

/*Следующие ф-и работают в паре 
//сначала
var B = []
//потом
B = refrash([1,1,1,0],B)
console.log(B)
sequence(B)
*/

function refrash(srs,output=[]){ //какой пункт был выбран первым srs = [0,1,0,0] ... [1,1,0,0] ... [1,1,1,0]  output = [0,1,0,0] ... [2,1,0,0] ... [2,1,3,0]
    if (output.length==0) output.length = srs.length;
    var max=0;
    for (var i=0;i<output.length;i++){
        if (output[i]>max) max=output[i];
    }
    for (var i=0;i< srs.length;i++){
        if (srs[i] == 0) { output[i] = 0} //сброшен
        if (srs[i] > 0) {
            if ( output[i] == 0 ) output[i] = ++max;
        }
    }
    return output;
}

function sequence(srss){//указывает порядковые ИНДЕКСЫ чисел по возрастанию srss = [0,1,0,0] ... [2,1,0,0] ... [2,1,3,0]  output = [1] ... [1, 0] ... [1, 0, 2]
    var srs = srss.slice(0);
    var output = [];
    output.length == srs.length;
    var max=0;
    for (var i=0;i<srs.length;i++){
        if (srs[i]>max) max=srs[i];
    }
    //var k=0;
    var min;
    var minIndex;
    var oldminIndex;
    for (j=0;j<srs.length;j++){
    min=max+1;
        for (i=0;i<srs.length;i++){
            if(srs[i]==0) continue;
            if (srs[i]<min) {
                min = srs[i];
                minIndex=i;
            }
        }
        if (oldminIndex == minIndex) continue;
        output[j] = minIndex;
        srs[minIndex]=0;
        oldminIndex = minIndex;
    }
    return output;
}
//////////////////////////////////////////
