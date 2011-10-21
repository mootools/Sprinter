
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
		var length = scripts.length, now = 0;
		var next = function(){
			if (now >= length) fn();
			else {
				var script = document.createElement('script');
				script.onload = next;
				script.src = scripts[now++];
				html.appendChild(script);
			}
		};
		next();
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
		path + 'jasmine/lib/jasmine-core/jasmine.js',
		path + 'jasmine/lib/jasmine-core/jasmine-html.js'
	], loadSuiteConfig);

	loadCSS([
		path + 'jasmine/lib/jasmine-core/jasmine.css'
	]);

})();
