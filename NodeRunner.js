#!/usr/bin/env node

var sys = require('sys');
var fs = require('fs');

// make jasmine functions global (like describe, it, jasmine)
var jas = require('./jasmine/jasmine')
for (var p in jas) global[p] = jas[p];

// suites we'll run
var suites = {};
var numberOfSuites = 0;

// parse which repositories and which suites we'll run
// this file can be called with: `./NodeRunner.js Base/SpecRunner,Node DOM/specificity`
var repositories = process.argv.slice(2);
repositories.forEach(function(value){
	var split = value.split('/');
	var _suites = ['SpecRunner'];
	if (split[1]) _suites = split[1].split(',');
	if (!split[0]){
		suites['../'] = _suites;
	} else {
		suites['../' + split[0] + '/Specs'] = _suites;
	}
	numberOfSuites += _suites.length;
});

var paths = Object.keys(suites);

console.log('Using these paths:' + [null].concat(paths).join('\n- '));
console.log('Testing ' + numberOfSuites + ' test suites');

// load suites.json files
paths.forEach(function(value){
	fs.readFile(value + '/suites.json', function(err, data){
		if (err) throw err;
		loadSuite(value, JSON.parse(data));
	});
});

// use requirejs() or another require() function to load the modules
var loadSuite = function(value, conf){
	var _suites = suites[value];
	if (_suites && _suites.length) _suites.forEach(function(suite){
		var config = conf[suite], req;
		if (config && config.requirejs){
			req = require('./requirejs/r.js');
			config.requirejs.baseUrl = value;
			req.config(config.requirejs);
			console.log(config.modules);
			req(config.modules, startSpecRunner);
		}
	});
};

// The Jasmine-Node reporter is the only file we need
var TerminalReporter = require('./jasmine-node/reporter').TerminalReporter;

jasmine.getEnv().addReporter(new TerminalReporter({
	print:       sys.print,
	verbose:     false,
	color:       true,
	onComplete:  function(){
		process.exit(-1);
	}
}));

var suitesToDo = numberOfSuites;
var startSpecRunner = function(){
	// execute the specs
	if (--suitesToDo == 0){
		console.log('\n');
		jasmine.getEnv().execute();
	}
};
