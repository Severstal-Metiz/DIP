var b1 = document.getElementById("b1");
b1.addEventListener("click",click1);

var b2 = document.getElementById("b2");
b2.addEventListener("click",click2);

var b3 = document.getElementById("b3");
b3.addEventListener("click",function(){
    clearInterval(timer);
    console.log("stop");
});

document.addEventListener('keydown', keydown );
document.addEventListener('keyup', keyup );

class cordclass {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    
}

class keyFlagClass{
    constructor(){
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
    }
}

var helpDiv;
var helpDivid = "RomixERR";
var canvas;
var context;
var counter = 0;
var cord;
var speed = new cordclass(0,0);
var keyFlag = new keyFlagClass();
var timer;

var hvost = [];




InitialHelpDiv();





function InitialHelpDiv(){
    if (document.getElementById(helpDivid) == null){
        helpDiv = document.createElement('div');
        helpDiv.id=helpDivid;    
        document.body.append(helpDiv);
        //мутим канвас
        canvas = document.createElement('canvas');
        canvas.id = "cvs";
        canvas.width = 500;
        canvas.height = 500;
        document.body.append(canvas);
        context = canvas.getContext('2d');
        cord = new cordclass(canvas.width / 2, canvas.height / 2);

        for (let i = 0; i < 100; i++) {
            hvost[i] = new cordclass(0,cord.y);
        }
        timer = setInterval(redraw,20);
    }
}

function redraw() {
    
        context.fillStyle = "rgb(255,255,128)";
        context.fillRect(0, 0, 500, 500);



        for (let i = 0; i < hvost.length; i++) {
            
            if(i<30){
                context.beginPath();            
                context.arc(hvost[i].x, hvost[i].y, 26, 0, 2 * Math.PI, false);
                context.fillStyle = 'green';  
                context.fill();
                context.stroke();        
            } 
            if(i>70){
              context.beginPath();            
              context.arc(hvost[i].x, hvost[i].y, 26, 0, 2 * Math.PI, false);
              context.fillStyle = 'red';  
              context.fill();
              context.stroke();        
            } 
            
        }
    
    
        context.beginPath();
        context.arc(cord.x, cord.y, 25, 0, 2 * Math.PI, false);
        context.fillStyle = 'green';
        context.fill();
        context.stroke();
        cord.x = cord.x + speed.x*0.1;
        cord.y = cord.y + speed.y*0.1;

        if (speed.y<=500)speed.y+=0.9;
       
        if (keyFlag.left) {
            speed.x-=1.1;
        } else{
            //if (speed.x<0) speed.x++;
        }
        if (keyFlag.right) {
            speed.x+=1.1;
        } else {
            //if (speed.x>0) speed.x--;
        }  

        if (keyFlag.up) {
            speed.y-=1.1;
        } else{
           // if (speed.y<0) speed.y++;
        }
        if (keyFlag.down) {
            speed.y+=1.1;
        } else {
          //  if (speed.y>0) speed.y--;
        }  

    
        if (cord.x<0) speed.x*= -1;
        if (cord.y<0) speed.y*= -1;
        if (cord.x>500) speed.x*= -1;
        if (cord.y>500) speed.y*= -1;

        if (speed.x>0) speed.x-=0.1;
        if (speed.x<0) speed.x+=0.1;
        if (speed.y>0) speed.y-=0.1;
        if (speed.y<0) speed.y+=0.1;


        
   
        hvost.unshift(hvost.pop());

        hvost[0].x = cord.x;
        hvost[0].y = cord.y;

}

function PrintHelpMessage(html){
    if (document.getElementById(helpDivid)!=null) {
        helpDiv.innerHTML = html; 
    }
}





function click1() {
    counter++;
    InitialHelpDiv();
    PrintHelpMessage("<strong>Всем привет!</strong> Вы прочитали важное сообщение. " + counter + " раз");
    
}

function click2() {
    PrintHelpMessage("Погодные условия позволяют!!!");
    
}


function keyup(event) {
    if (event.code == 'ArrowUp') {
       keyFlag.up = false;
        
    }
    if (event.code == 'ArrowDown') {
        keyFlag.down = false;  

    }
    if (event.code == 'ArrowLeft') {
         keyFlag.left = false;

    }
    if (event.code == 'ArrowRight') {
         keyFlag.right = false;

    }  
    
}

function keydown(event) {
    //console.log("key = " + event.key + "  code = " + event.code);
    if (event.code == 'ArrowUp') {
       keyFlag.up = true;        
    }
    if (event.code == 'ArrowDown') {
        keyFlag.down = true;
    }
    if (event.code == 'ArrowLeft') {
         keyFlag.left = true;
    }
    if (event.code == 'ArrowRight') {
         keyFlag.right = true;
    }  

}