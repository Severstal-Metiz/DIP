var text = document.getElementById("text");
text.title = "NEW";
text.style.color = "red";
text.style.backgroundColor = "black";
text.innerHTML = "New <br> STRINGI";

console.log("span");
var spans = document.getElementsByTagName("span");
show(spans);

console.log("simpl-dimpl");
spans = document.getElementsByClassName("simpl-dimpl");
show(spans);

console.log("popit");
spans = document.getElementsByClassName("popit");
show(spans);


function show(el){
  for (var i = 0; i < el.length; i++) {
     console.log(el[i].innerHTML);
   }
}
