
var pkg = require('../package.json');
var settings = require('../settings.json');
var common = require('../lib/common');
var fs = require('fs');
var watch = require('watch');
var spawn = require('child_process').spawn;

var appId = -1;
var apps = [];
var childs = [];

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
		if (typeof app.name != 'undefined' && app.name == name) {
			return app;
		}
	}
	return null;	
}

function getAppById( id ) {
	
	for (var a=0; a<apps.length; a++) {
		var app = apps[a];
		if (typeof app.id != 'undefined' && app.id == id) {
			return app;
		}
	}
	return null;	
}

function getChildByAppId( id ) {
	
	for (var c=0; c<childs.length; c++) {
		var child = childs[c];		
		console.log('[child]: search: ' + id + ' id:' + child.id + ' proc:' + child.proc);
		if (typeof child.id != 'undefined' && child.id == id) {
			console.log('found: Yes.');
			return child;
		}
	}
	console.log('found: No.');
	return null;
}

function getError( message ) {
	return {
		version: common.pkg.version,
		result: common.results.SPZ_FAILED,
		error: message,
		success: '',
		data: ''
	}	
}

function getSucess( data, message ) {
	return {
		version: common.pkg.version,
		result: common.results.SPZ_OK,
		error: '',
		success: message,
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
	
	if (getAppByName( app.name )) {
		return getError('App name (' + app.name + ') already exists.');
	}
	
	appId++;
	app.id = appId;
	app.name = app.name || 'untitled' + app.id;
	
	apps.push( app );

	return getSucess( null, 'App (' + app.name + ') succesfully added.' );
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
	
	return getSucess( apps, 'App (' + app.name + ') succesfully updated.' );
}


function list( app ) {	
	
	for (var a=0; a<apps.length; a++) {
		var app = apps[a];
		var child = getChildByAppId( app );
		if (child) {
			app.uptime = new Date().getTime() - app.created;
		}
	}
	
	return getSucess( apps );
}

function start( appToStart ) {
	
	var app = getAppByName( appToStart.name );	
	if (!app) {
		return getError('App name (' + appToStart.name + ') doesn\'t exists.');
	}	
	if (!app.script || app.script == '' || !fs.existsSync(app.script) ) {
		return getError('App script (' + app.script + ') doesn\'t exists.');
	}	
	if (app.status == 'online') {
		return getError('App (' + app.name + ') already running.');
	}	
	
	var command = settings.bin;
	var arguments = [ app.script ];
	var options = {};
	
	if (app.uid || app.gid) {
		/*var userCommand = 'sudo ';
		if (app.uid) {
			userCommand += '-H -u ' + app.uid + ' ';
		}
		if (app.gid) {
			userCommand += '-g ' + app.gid + ' ';
		}
		userCommand += 'bash -c \'' + command + '\'';*/
		if (app.uid) {
			options.uid = app.uid;
		}
		if (app.gid) {
			options.uid = app.gid;
		}
	}
	
	var child = {
			id: app.id,
			proc: null
	};
	
	child.proc = spawn(command, arguments, options);	
	
	/*child = exec( command, function (error, stdout, stderr) {
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
		}		
	});*/
	childs.push(child);
	
	app.status = 'online';
	app.pid = child.proc.pid;
	app.stats.started++;
	
	return getSucess( null, 'App (' + app.name + ') succesfully started.' );
}

function stop( appToStop ) {	
	
	var app = getAppByName( appToStop.name );	
	if (!app) {
		return getError('App name (' + appToStop.name + ') doesn\'t exists.');
	}
	
	var child = getChildByAppId( app.id );
	if (!child) {
		return getError('App (' + app.name + ') cannot be stopped.');
	}
	
	if (app.status == 'online') {
		if (child) {
			app.stats.stopped++;			
			if (child.proc) {
				child.proc.kill('SIGTERM');
				app.pid = '';
				app.status = 'down';
			}
		}
	}
	
	return getSucess( null, 'App (' + app.name + ') succesfully stopped.' );
}

function restart( app ) {	
	
	stop( app );
	
	app.stats.restarted++;
	
	return start( app );
}

module.exports.install = install;
module.exports.add = add;
module.exports.list = list;
module.exports.set = set;
module.exports.start = start;
module.exports.restart = restart;
module.exports.stop = stop;
