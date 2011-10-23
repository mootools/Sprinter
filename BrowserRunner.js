
(function(){

	// we expect a public variable (suite from suites.json)
	if (typeof suite != 'string'){
		throw new Error('No suite is selected');
	}

	if (typeof path != 'string'){
		throw new Error('The path variable must be set in your HTML document');
	}

	var html = document.html || document.getElementsByTagName('html')[0];

	// in order loading of the JS files
	var loadJS = function(scripts, fn){
		var now = 0, timer;
		var next = function(i){
			clearTimeout(timer);
			if (i < now){}
			else if (now >= scripts.length) fn();
			else {
				var script = document.createElement('script');
				if (typeof script.onreadystatechange != 'undefined'){
					script.onreadystatechange = function(){
						if (script.readyState == 'complete' || script.readyState == 'loaded'){
							next(i + 1);
						}
					};
				} else {
					script.onload = function(){ next(i + 1) };
				}
				script.src = scripts[now++];
				html.appendChild(script);
				timer = setTimeout(function(){
					throw new Error('timedout loading script: ' + scripts[i]);
				}, 5000);
			}
		};
		next(0);
	};

	var loadCSS = function(links){
		for (var i = 0; i < links.length; i++){
			var link = document.createElement('link');
			link.setAttribute('rel', 'stylesheet');
			link.setAttribute('type', 'text/css');
			link.setAttribute('href', links[i]);
			html.appendChild(link);
		}
	}

	// Load the suites.json file
	var loadSuiteConfig = function(){
		new SimpleRequest().send('suites.json', function(json){
			var data = window.JSON && JSON.parse ? JSON.parse(json) : eval('(' + json + ')');
			if (!data[suite]){
				throw new Error('The selected suite was not available in suites.json');
			}
			loadSuite(data[suite]);
		});
	};

	// use requirejs() or another require() function to load the modules
	var loadSuite = function(config){
		if (config.requirejs){
			loadJS([
				path + 'requirejs/require.js'
			], function(){
				var req = window[config.require];
				req.config(config.requirejs);
				req(config.modules, startSpecRunner);
			});
		} else {
			// for example for synchronous (optimized builds)
			var req = window[config.require];
			req(config.modules, startSpecRunner);
		}
	};

	// start jasmine
	var startSpecRunner = function(){
		jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
		jasmine.getEnv().execute();
	};

	// start loading all files and stuff
	loadJS([
		path + 'SimpleRequest.js',
		path + 'jasmine/jasmine.js',
		path + 'jasmine/jasmine-html.js'
	], loadSuiteConfig);

	loadCSS([
		path + 'jasmine/jasmine.css'
	]);

})();
