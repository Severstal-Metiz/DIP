var isHighlight = false;
var vop;

console.log("START");

//function getElementsByClassName(node, classname) {
//    var a = [];
//    var re = new RegExp('(^| )'+classname+'( |$)');
//    var els = node.getElementsByTagName("*");
//    for(var i=0,j=els.length; i<j; i++)
//        if(re.test(els[i].className))a.push(els[i]);
//    return a;
//}


function GetVopros(){
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

function GetYesNo(){
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


function GetVoprosOld(){
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


document.body.addEventListener('mousewheel', function () {
	console.log("KOLESO");
/* 	var select = window.getSelection() + '';

	if ((select == '') || (select.length > 110)) return;

	select = select.trim();
	var html = document.body.innerHTML.split(select).join('<x>' + select + '</x>');
	document.body.innerHTML = html;
	console.log("simpl-dimpl");
	SaveDB(select);
	isHighlight = true; */
}, false);

//ЩЕЛЧЁК МЫШИ
document.body.addEventListener('mousedown', function () {
	console.log("mousedown");
	GetVopros();
	GetYesNo();
/* 	if (!isHighlight) return; // если нет подсветки - выходим

	var html = document.body.innerHTML.split('<x>').join('');
	html = html.split('</x>').join('');
	document.body.innerHTML = html;
	console.log("popit");
	LoadDB();
	isHighlight = false; */
}, false);


//ЗАБИРАЕТ ЗНАЧЕНИЯ ИЗ ПОЛЯ ВВОДА 
document.addEventListener('keyup', function(e) {
        console.log("KEY PRESS: " + e.key);
		var input = document.querySelector('input');
		//var input = document.getElementsByClassName('ant-input');
		console.log(input);
		Timeout(1000);
		console.log(input.value);
});

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
/*
window.addEventListener("beforeunload", function (e) {
  //var confirmationMessage = "\o/";
  console.log("EVENT EXIT");
  var v = document.getElementsByName("answerIds"); //Получение атрибутов
  if (v.length == 0) return;
  console.log(v);
  console.log("Selected IDS:"+v[0].value);
  //(e || window.event).returnValue = confirmationMessage; //Gecko + IE
  return 0;//confirmationMessage;                            //Webkit, Safari, Chrome
});
*/

function SaveDB(select){
	chrome.storage.local.set({ key: select }).then(() => {
	console.log("Value is set1");
	});
	chrome.storage.local.set({ goi: "Гои спасают мир!" }).then(() => {
	console.log("Value is set2");
	});
}

function LoadDB(){
	chrome.storage.local.get(["key","goi"]).then((result) => {
	console.log("Value currently is 1: " + result.key + " 2: " + result.goi);
	});
}

/*
document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementsByClassName('ant-btn');
    // onClick's logic below:
    link.addEventListener('click', function() {
        console.log('CLICK');
    });
});
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