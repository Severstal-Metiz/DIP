document.addEventListener('DOMContentLoaded', function () {
	document.getElementById("link").innerHTML = "<a href=''>ПЕРЙТИ НА СТРАНИЦУ ПРЕДСМЕННОГО</a>";
	document.getElementById("link").onclick = function () {
					chrome.tabs.create({active: true, url: 'https://sqp.mobileapp.severstal.com/#/'});
	};
	document.getElementById("loadDB").innerHTML = "<button>LOAD DB from backup</button>";
	document.getElementById("loadDB").addEventListener("click",async () =>{
		var [fileHandle] = await window.showOpenFilePicker();
		var file = await fileHandle.getFile();
		var fileContent = await file.text();
		//console.log(fileContent)
		DB = JSON.parse(fileContent);
		console.log("ЗАГРУЗКА БАЗЫ ДАННЫХ С ДИСКА ВЫПОЛНЕНО");
		console.log(DB);
		if (DB == null) return;
		if (DB.length<1) return;
		chrome.storage.local.set({ key: DB }).then(() => { //сделать обновление базы данных в хранилище на основании текущей загруженной версии базы данных
		console.log("ОБНОВЛЕНИЕ ЛОКАЛЬНОГО ХРАНИЛИЩА ВЫПОЛНЕНО");
		alert("ОБНОВЛЕНИЕ ЛОКАЛЬНОГО ХРАНИЛИЩА ВЫПОЛНЕНО");
		}); 
	});
	
	document.getElementById("saveDB").innerHTML = "<button>SAVE DB to backup</button>";
	document.getElementById("saveDB").addEventListener("click",async () =>{
		//загрузить базу из хранилища
		await chrome.storage.local.get(["key"]).then((result) => { //загрузка базы данных (из хранилища) 
			if (result.key == null) return;
			if (!Array.isArray(result.key)) return;
			DB = result.key;
			console.log("ЗАГРУЗКА ЛОКАЛЬНОГО ХРАНИЛИЩА ВЫПОЛНЕНА");
		});
		var fileData = await JSON.stringify(DB,null,"\t");
		var fileHandle = await window.showSaveFilePicker();
		var writableStream = await fileHandle.createWritable();
		await writableStream.write(fileData);
		await writableStream.close();
		console.log("СОХРАНЕНИЕ ТЕКУЩЕЙ БАЗЫ ДАННЫХ НА ДИСК ВЫПОЛНЕНО");
		alert("СОХРАНЕНИЕ ТЕКУЩЕЙ БАЗЫ ДАННЫХ НА ДИСК ВЫПОЛНЕНО");
	});
});
	


