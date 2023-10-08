var DB = [];


var loadbtn = document.getElementById("loadbtn");
loadbtn.addEventListener("click",async () =>{
  var [fileHandle] = await window.showOpenFilePicker()
  var file = await fileHandle.getFile()
  var fileContent = await file.text()
  //console.log(fileContent)
  DB = JSON.parse(fileContent);
  console.log("ЗАГРУЗКА БАЗЫ ДАННЫХ С ДИСКА ВЫПОЛНЕНО");
  console.log(DB);
});


var savebtn = document.getElementById("savebtn");
savebtn.addEventListener("click",async () =>{
  var fileData = await JSON.stringify(DB,null,"\t");
  var fileHandle = await window.showSaveFilePicker()
  var writableStream = await fileHandle.createWritable()
  await writableStream.write(fileData)
  await writableStream.close()
  console.log("СОХРАНЕНИЕ ТЕКУЩЕЙ БАЗЫ ДАННЫХ НА ДИСК ВЫПОЛНЕНО");
});
