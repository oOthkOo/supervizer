
var common = require('../lib/common');
var fs = require('fs');
var watch = require('watch');
var pkg = require('../package.json');
var settings = require('../settings.json');

var appId = 0;
var apps = [];

var appSample = {
		id: '1',
		name: 'hello-web',
		group: 'main',
		uid: 'hello-web',
		gid: 'hello-web',
		script: '/var/lib/node/hello-web/server.js',
		watch: {
			interval: 2000,
			path: '/var/lib/node/hello-web',
			excludes: [
				'logs',
				'public',
				'build',
				'scripts'
			]
		},
		files: {
			pid: '/var/lib/node/hello-web/server.pid',
			log: '/var/lib/node/hello-web/server.log'
		},
		host: 'http://localhost',
		port: 3200,
		pid: '',
		status: 'down',
		stats: {
			started: 0,
			crashed: 0,
			stopped: 0,
			restarted: 0,
			memory: 0,
			cpu: 0
		}
	}

/**
 * Private functions
 */

function getAppByName( name ) {
	
	for (var a=0; a<apps.length; a++) {
		var app = apps[a];
		var n = app.name || '';
		if (n != '' && n == name) {
			return app;
		}
	}
	return null;	
}

function getAppById( id ) {
	
	for (var a=0; a<apps.length; a++) {
		var app = apps[a];
		var i = app.id || '';
		if (i != '' && i == id) {
			return app;
		}
	}
	return null;	
}

function getError( message ) {
	return {
		version: common.pkg.version,
		result: common.results.SPZ_FAILED,
		error: message,
		data: ''
	}	
}

function getSucess() {
	return getSucess( '' );
}

function getSucess( data ) {
	return {
		version: common.pkg.version,
		result: common.results.SPZ_OK,
		error: '',
		data: data
	}	
}

/**
 * Public functions
 */

function install( host, port ) {

	return getSucess();
}

function add( app ) {
	
	if (!app) {
		return getError('App contains invalid parameters.');
	}
	
	if (getAppByName( app.name )) {
		return getError('App name (' + app.name + ') already exists.');
	}
	
	appId++;
	app.id = appId;
	app.name = app.name || 'untitled' + app.id;
	
	apps.push( app );
	
	console.log( 'app added.' );

	return getSucess();
}

function set( data ) {
	
	var app = getAppByName( data.search );	
	if (!app) {
		return getError('App name (' + data.search + ') doesn\'t exists.');
	}
	
	for (var o=0; o<data.options.length; o++) {
		var option = data.options[o];		
		app.name = option.name || app.name;
		app.group = option.group || app.group;		
		if (option.run) {
			app.uid = option.run.user || app.uid;
			app.gid = option.run.group || app.gid;			
		}		
		app.script = option.script || app.script;
		app.watch.path = option.watch || app.watch.path;
		app.watch.excludes = option.excludes || app.watch.excludes;
		app.watch.interval = option.interval || app.watch.interval;
		app.files.pid = option.pid || app.files.pid;
		app.files.log = option.log || app.files.log;
		app.host = option.host || app.host;
		app.port = option.port || app.port;
	}
	
	if (app.status == 'online') {
		
		
	}
	
	return getSucess( apps );
}


function list( app ) {	
	
	return getSucess( apps );
}

function start( app ) {
	
	var app = getAppByName( app.name );	
	if (!app) {
		return getError('App name (' + app.name + ') doesn\'t exists.');
	}
	
	
	
	
	
	return getSucess( apps );
}

module.exports.install = install;
module.exports.add = add;
module.exports.list = list;
module.exports.set = set;
module.exports.start = start;
