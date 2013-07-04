
var pkg = require('../package.json');
var settings = require('../settings.json');
var common = require('../lib/common');
var fs = require('fs');
var watch = require('watch');
var spawn = require('child_process').spawn;

var appId = -1;
var apps = [];
var childs = [];

/**
 * Private functions
 */

function showLog( message ) {
	console.log( '[' + getDate("%Y-%m-%d %H:%M:%S",false) + ']: ' + message );
}

function showInfo( message, name ) {
	showLog('[INFO]: ' + (name ? '(' + name + ') ' : '') + message );	
}

function showError( message, name ) {
	showLog('[ERROR]: ' + (name ? '(' + name + ') ' : '') + message );	
}

function getDate(fstr, utc) {
	var date = new Date();
	  utc = utc ? 'getUTC' : 'get';
	  return fstr.replace (/%[YmdHMS]/g, function (m) {
	    switch (m) {
	    case '%Y': return date[utc + 'FullYear'] ();
	    case '%m': m = 1 + date[utc + 'Month'] (); break;
	    case '%d': m = date[utc + 'Date'] (); break;
	    case '%H': m = date[utc + 'Hours'] (); break;
	    case '%M': m = date[utc + 'Minutes'] (); break;
	    case '%S': m = date[utc + 'Seconds'] (); break;
	    default: return m.slice (1);
	    }	    
	    return ('0' + m).slice (-2);
	  });
	}

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
		//console.log('[child]: search: ' + id + ' id:' + child.id + ' proc:' + child.proc);
		if (typeof child.id != 'undefined' && child.id == id) {
			//console.log('found: Yes.');
			return child;
		}
	}
	//console.log('found: No.');
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

function isSuccess( response ) {	
	return response.result == common.results.SPZ_OK;
}

function reset( app ) {
	app.status = 'down';
	app.timer = null;
	app.stopped = false;
	app.attempted = false;
	app.stdout = null;
	app.stats.uptime = 0;
	app.stats.started = 0;
	app.stats.crashed = 0;
	app.stats.stopped = 0;
	app.stats.restarted = 0;
	app.stats.memory = 0;
	app.stats.cpu = 0;
}

/**
 * Public functions
 */

function install( host, port ) {
	
	
	
	
	
	
	
	
	return getSucess();
}

function load( data ) {
	
	var message = 'The apps configuation file \'' + data.file + '\' was loaded.';
	
	fs.readFile(data.file, function (err, data) {
		if (err) {
	    	showError('<load> Unable to open apps json file \'' + data.file + '\'.');
	    	showError(err);
	    	return getError('Apps json file (' + data.file + ') cannot be loaded.');	
	    }
		else {					
			
			stopAll();
			var temp = apps;
			apps = JSON.parse(data);
			if (!apps) {
				apps = temp;
				//restartAll();
				
				showError('<load> Apps json file \'' + data.file + '\' is invalid.');
				return getError('Apps json file (' + data.file + ') is invalid.');
			}
			
			// Reset all apps
			for (var a=0; a<apps.length; a++) {
				var app = apps[a];
				
				reset( app );
				appId++;
				app.id = appId;
			}
			
			//restartAll();
		}
	});
	
	showInfo( message );
	return getSucess( null, message );
}

function save( data ) {
	
	var message = 'The apps configuation file \'' + data.file + '\' was saved.';
	
	fs.writeFile(data.file, JSON.stringify(apps), function(err) {
	    if (err) {
	    	showError('<save> Unable to create apps json file \'' + data.file + '\'.');
	    	showError(err);
	    	return getError('Apps json file (' + data.file + ') cannot be created.');	
	    }
	});
	
	showInfo( message );
	return getSucess( null, message );
}

function add( app ) {
	
	if (getAppByName( app.name )) {
		showError('<add> App already exists.', app.name);
		return getError('App name (' + app.name + ') already exists.');
	}
	
	appId++;
	app.id = appId;
	app.name = app.name || 'untitled' + app.id;
	
	apps.push( app );

	showInfo('App succesfully added.', app.name);
	return getSucess( null, 'App (' + app.name + ') succesfully added.' );
}

function set( data ) {
	
	var app = getAppByName( data.search );	
	if (!app) {
		showError('<set> App doesn\'t exists.', data.search);
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
		for (var o=0; o<data.options.length; o++) {
			var option = data.options[o];
			if (option.run || option.script || option.watch || 
				option.excludes || option.interval || option.pid ||
				option.log || option.host || option.port) {
				return restart( app );		
			}
		}
	}
	
	showInfo('App succesfully updated.', app.name);
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
	
	showInfo('All apps succesfully listed.');
	return getSucess( apps );
}

function start( appToStart ) {
	
	var app = getAppByName( appToStart.name );	
	if (!app) {
		showError('<start> App doesn\'t exists.', appToStart.name);
		return getError('App name (' + appToStart.name + ') doesn\'t exists.');
	}	
	if (!app.script || app.script == '' || !fs.existsSync(app.script) ) {
		showError('<start> Script file \'' + app.script + '\ doesn\'t exists.', app.name);
		return getError('App script (' + app.script + ') doesn\'t exists.');
	}	
	if (app.status == 'online') {
		showError('<start> App already running.', app.name);
		return getError('App (' + app.name + ') already running.');
	}	
	
	var command = settings.bin;
	var args = [ app.script, app.host, app.port ];
	var opts = {};
	
	/*if (app.uid || app.gid) {
		if (app.uid) {
			options.uid = app.uid;
		}
		if (app.gid) {
			options.uid = app.gid;
		}
	}*/
	
	var child = {
			id: app.id,
			proc: null
	};
	
	child.proc = spawn(command, args, opts);
	if (!child.proc) {
		showError('<start> App cannot be run.', app.name);
		return getError('App (' + app.name + ') cannot be run.');
	}
	
	//child.proc.stdout.pipe(process.stdout);
	//child.proc.stderr.pipe(process.stdout);
	
	// Settings crash management
	if (app.keep) {
		child.proc.on('close', function(code) {
			  showInfo('App exited with code (' + code + ')', app.name);
			  
			  app.status = 'down';
			  if (!app.stopped) {
			  
				  if (app.curAttempt > app.attempt - 1) {
					  app.curAttempt = 0;
					  app.attempted = false;
					  return;	  
				  }
				  
				  app.attempted = true;
				  app.curAttempt++;
				  
				  showInfo('Relaunching app attempt ' + app.curAttempt, app.name);			  
				  start( app );
			  }
		});
	}		
	childs.push(child);
	
	app.pid = child.proc.pid;
	
	// Setting pid file
	if (app.files && app.files.pid) {
		fs.writeFile(app.files.pid, app.pid, function(err) {
		    if (err) {
		    	showError('<start> Unable to create app pid file \'' + app.files.pid + '\'.', app.name);
		    	showError(err, app.name);
		    	return getError('App pid file (' + app.files.pid + ') cannot be created.');	
		    }
		    else {
		    	showInfo('The pid file \'' + app.files.pid + '\' was created.', app.name);
		    }
		});
	}
	
	// Setting log file
	if (app.files && app.files.log) {

		app.stdout = fs.createWriteStream(app.files.log, { flags: 'a', encoding: 'utf8' });
		if (!app.stdout) {
			showError('<start> Unable to create app log file \'' + app.files.log + '\'.', app.name);
			return getError('App log file (' + app.files.log + ') cannot be created.');	
		}		
		
		child.proc.stdout.pipe(app.stdout);
		child.proc.stderr.pipe(app.stdout);
		
		showInfo('The log file \'' + app.files.log + '\' was created.', app.name);
	}
	
	// Setting watch timer
	
	
	// Settings app parameters
	app.status = 'online';
	if (!app.attempted) {
		app.curAttempt = 0;
	}
	app.stats.started++;
	app.stopped = false;
	
	showInfo('App succesfully started.', app.name);
	return getSucess( null, 'App (' + app.name + ') succesfully started.' );
}

function startAll( app ) {
	
	var appCount = 0;
	
	for (var a=0; a<apps.length; a++) {
		var app = apps[a];
		if (app.status == 'down') {		
			var result = start( app );
			if ( !isSuccess( result )) {
				return result;
			}
			appCount++;
		}
	}
	
	var message = appCount + ' apps succesfully started.';
	
	showInfo(message, app.name);
	return getSucess( null, message );
}

function stop( appToStop ) {	
	
	var app = getAppByName( appToStop.name );	
	if (!app) {
		showError('<stop> App doesn\'t exists.', appToStop);
		return getError('App name (' + appToStop.name + ') doesn\'t exists.');
	}
	if (app.status == 'down') {
		showError('<stop> App already stopped.', app.name);
		return getError('App (' + app.name + ') already stopped.');
	}
	var child = getChildByAppId( app.id );
	if (!child) {
		showError('<stop> App cannot be stopped.', appToStop);
		return getError('App (' + app.name + ') cannot be stopped.');
	}
	
	app.status = 'down';
	app.pid = '';
	app.stopped = true;
	app.attempted = false;
	app.stats.stopped++;
	
	if (child.proc) {
		if (app.stdout) {
			child.proc.stdout.unpipe(app.stdout);
			child.proc.stderr.unpipe(app.stdout);
			app.stdout.end();
		}
		child.proc.kill();
	}
	
	showInfo('App succesfully stopped.', app.name);
	return getSucess( null, 'App (' + app.name + ') succesfully stopped.' );
}

function stopAll() {
	
	var appCount = 0;
	
	for (var a=0; a<apps.length; a++) {		
		var app = apps[a];
		if (app.status == 'online') {
			var result = stop( app );
			if ( !isSuccess( result )) {
				return result;
			}
			appCount++;
		}				
	}
	
	var message = appCount + ' apps succesfully stopped.';
	
	showInfo(message);
	return getSucess( null, message );
}

function restart( app ) {	
	
	stop( app );
	
	app.stats.restarted++;
	
	return start( app );
}

function restartAll() {
	
	var appCount = 0;
	
	for (var a=0; a<apps.length; a++) {		
		var result = restart( apps[a] );
		if ( !isSuccess( result )) {
			return result;
		}
		appCount++;
	}
	
	var message = appCount + ' apps succesfully restarted.';
	
	showInfo(message);
	return getSucess( null, message );
}

module.exports.showLog = showLog;
module.exports.showInfo = showInfo;
module.exports.showError = showError;
module.exports.load = load;
module.exports.save = save;
module.exports.install = install;
module.exports.add = add;
module.exports.list = list;
module.exports.set = set;
module.exports.start = start;
module.exports.startAll = startAll;
module.exports.restart = restart;
module.exports.restartAll = restartAll;
module.exports.stop = stop;
module.exports.stopAll = stopAll;
