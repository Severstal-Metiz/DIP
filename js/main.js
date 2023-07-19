console.log("start ");
var flag=false;

function onClickButton(btn){
  var ih;
  flag = !flag;
  if (flag){
  ih = "<h4>" + "ААААА" + "</h4>";
  }else{
  ih = "<h1>" + "ООООО" + "</h1>";
  }
  btn.innerHTML = ih;
  console.log(btn.name);
  btn.name = "ГАВНО";
  btn.style.background = "red";
}

function onInput(el){
  console.log(el.value);
}
