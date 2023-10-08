var loadbtn = document.getElementById("loadbtn");
loadbtn.addEventListener("click",async () =>{
  var [fileHandle] = await window.showOpenFilePicker()
  var file = await fileHandle.getFile()
  var fileContent = await file.text()
  console.log(fileContent)
});


fileData = "Ляляля ляляля лялялялялялялял";

var savebtn = document.getElementById("savebtn");
savebtn.addEventListener("click",async () =>{
  var fileHandle = await window.showSaveFilePicker()
  var writableStream = await fileHandle.createWritable()
  await writableStream.write(fileData)
  
  await writableStream.close()
});
