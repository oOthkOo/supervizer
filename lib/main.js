
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
	
	apps.push( app );
	
	console.log( 'app added.' );

	return getSucess();
}

function list( app ) {	
	
	return getSucess( apps );
}

function list( app ) {	
	
	return getSucess( apps );
}

module.exports.install = install;
module.exports.add = add;
module.exports.list = list;
