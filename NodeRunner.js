#!/usr/bin/env node

var sys = require('sys');
var fs = require('fs');

var ProjectSpecs = function(path, suites){
	if (!suites){
		var split = path.split('/');
		suites = split[1] ? split[1].split(',') : ['SpecRunner'];
		// called through Sprinter/NodeRunner.js or Base/Specs/Sprinter/NodeRunner.js
		path = split[0] ? ('../' + split[0] + '/Specs') : '../';
	}
	this.path = path;
	this.suites = suites;
	this.config = {};
};

ProjectSpecs.prototype.loadConfig = function(fn){
	var self = this;
	fs.readFile(this.path + '/suites.json', function(err, data){
		if (err) throw err;
		self.config = JSON.parse(data);
		if (fn) fn.call(self, self.data);
	});
};

ProjectSpecs.prototype.require = function(fn){
	var todo = this.suites.length;
	if (todo == 0) return fn();
	var _fn = function(){
		if (--todo == 0) fn();
	};
	this.suites.forEach(function(suite){
		var config = this.config[suite], req;
		if (config && config.requirejs){
			req = require('./requirejs/r.js');
			config.requirejs.baseUrl = this.path;
			req.config(config.requirejs);
			req(config.modules, _fn);
		} else {
			// always call the _fn function, so fn will be executed eventually
			_fn();
		}
	}, this);
};

// make jasmine functions global (like describe, it, jasmine)
var jas = require('./jasmine/jasmine')
for (var p in jas) global[p] = jas[p];

// number of project we have
var projects = 0;

// parse which repositories and which suites we'll run
// this file can be called with: `./NodeRunner.js Base/SpecRunner,Node DOM/specificity`
var repositories = process.argv.slice(2);

console.log('Using these paths:');
repositories.forEach(function(value){
	var project = new ProjectSpecs(value);
	console.log('- ' + project.path);
	project.loadConfig(function(){
		this.require(startSpecRunner);
	});
	projects++;
});

// The Jasmine-Node reporter is the only file we need
var TerminalReporter = require('./jasmine/reporter').TerminalReporter;

jasmine.getEnv().addReporter(new TerminalReporter({
	print:       sys.print,
	verbose:     false,
	color:       true,
	onComplete:  function(){
		process.exit(0);
	}
}));

var projectsToRequire = projects;
var startSpecRunner = function(){
	// execute the specs
	if (--projectsToRequire == 0){
		console.log('\n');
		jasmine.getEnv().execute();
	}
};
