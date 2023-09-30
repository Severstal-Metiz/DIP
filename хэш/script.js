var b1 = document.getElementById("b1");
b1.addEventListener("click",click1);

var b2 = document.getElementById("b2");
b2.addEventListener("click",click2);

var helpDiv;
var helpDivid = "RomixERR";
function InitialHelpDiv(){
    if (document.getElementById(helpDivid) == null){
        helpDiv = document.createElement('div');
        //helpDiv.className = "alert";
        //helpDiv.innerHTML = "";
        helpDiv.id=helpDivid;    
        document.body.append(helpDiv);
    }
}

function PrintHelpMessage(html){
    if (document.getElementById(helpDivid)!=null) {
        helpDiv.innerHTML = html; 
    }
}



var counter = 0;

function click1() {
    counter++;
    InitialHelpDiv();
    PrintHelpMessage("<strong>Всем привет!</strong> Вы прочитали важное сообщение. " + counter + " раз");
}

function click2() {
    PrintHelpMessage("Погодные условия позволяют!!!");
}