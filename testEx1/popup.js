document.addEventListener('DOMContentLoaded', function () {
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        (function () {
            var ln = links[i];
				var location = 'https://sqp.mobileapp.severstal.com/#/';
				ln.onclick = function () {
					chrome.tabs.create({active: true, url: location});
				};
        })();
    }
});

	


