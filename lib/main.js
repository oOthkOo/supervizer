
var pkg = require('../package.json');
var settings = require('../settings.json');
var common = require('../lib/common');
var watch = require('../lib/watch');
var usage = require('usage');
var sync = require('synchronize');
var fs = require('fs');
var spawn = require('child_process').spawn;

var appId = 0;
var apps = [];
var childs = [];
var watchers = [];
var time = new Date().getTime();

var master_uid = process.getuid ? process.getuid() : '0'
var master_gid = process.getgid ? process.getgid() : '0'

apps.push({
	id: '0',
	name: 'master',
	group: 'master',
	uid: master_uid,
	gid: master_gid,
	script: '',
	options: '',
	created: time,
	started: time,
	watch: {			
		path: '',
		excludes: []
	},
	timer: null,
	stopped: false,
	attempted: false,
	stdout: null,		
	files: {
		pid: '',
		log: ''
	},
	host: settings.host,
	port: settings.port,
	pid: process.pid,
	keep: false,
	curAttempt: 0,
	attempt: 0,		
	status: 'online',
	stats: {
		uptime: 0,
		started: 0,
		crashed: 0,
		stopped: 0,
		restarted: 0,
		memory: 0,
		cpu: 0
	}
});

childs.push({
	id: '0',
	proc: process
});

/**
 * Private functions
 */

function showLog( message ) {
	console.log( '[' + formatDate(new Date(),"%Y-%m-%d %H:%M:%S",false) + ']: ' + message + '.' );
}

function showInfo( message, name ) {
	showLog('[INFO]: ' + (name ? '(' + name + ') ' : '') + message );	
}

function showError( message, name ) {
	showLog('[ERROR]: ' + (name ? '(' + name + ') ' : '') + message );	
}

function formatDate(date, fstr, utc) {	
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

function getAppIndex( name ) {
	
	for (var a=0; a<apps.length; a++) {
		var app = apps[a];
		if (typeof app.name != 'undefined' && app.name == name) {
			return a;
		}
	}
	return -1;
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

function getWatcherByAppId( id ) {
	
	for (var c=0; c<watchers.length; c++) {
		var watcher = watchers[c];		
		//console.log('[watcher]: search: ' + id + ' id:' + watcher.id + ' watcher:' + watcher.watcher);
		if (typeof watcher.id != 'undefined' && watcher.id == id) {
			//console.log('found: Yes.');
			return watcher.watcher;
		}
	}
	//console.log('found: No.');
	return null;
}

function contains( a, x ) {
	if (!a) {
		return false;
	}
	for (var c=0; c<a.length; c++) {
		if (x == a[c]) {
			return true;
		}
	}
	return false;
}

function getError( message ) {
	return {
		version: common.pkg.version,
		result: common.results.SPZ_FAILED,
		error: message + '.',
		success: '',
		data: ''
	}	
}

function getSuccess( data, message ) {
	return {
		version: common.pkg.version,
		result: common.results.SPZ_OK,
		error: '',
		success: message + '.',
		data: data
	}	
}

function isSuccess( response ) {	
	return response.result == common.results.SPZ_OK;
}

function reset( app ) {
	app.status = 'down';
	app.pid = '';
	app.timer = null;
	app.started = 0;
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
	return app;
}

function relaunchApp( app ) {
	
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

function updateAppStats( app ) {
	
	// Update app stats
	if (app.status == 'online') {
		
		usage.lookup(app.pid, {
				keepHistory: true
			},
			function(err, result) {
				if (!err) {
					if (!app.stats) {
						app.stats = {};
					}
					app.stats.cpu = result.cpu ? result.cpu.toFixed(2) : 0;
					app.stats.memory = result.memory ? result.memory : 0;
					//console.log( result );						
				}				
		});
	}
}

/**
 * Public functions
 */

function install( host, port ) {	
	
	return getSuccess();
}

function uninstall() {	
	
	return getSuccess();
}

function load( data ) {
	
	var json = '';	
	
	try {
		json = fs.readFileSync(data.file);		
	}
	catch (e) {		
	   	showError('<load> Unable to open apps json file \'' + data.file + '\'');
	    showError(e.message);
	    return getError('Apps json file (' + data.file + ') cannot be loaded');	
	}	
	
	stopAll();	
	
	try {
		var temp = JSON.parse(json);
		
		appId = 0;
		apps.splice(1,apps.length-1);		
		
		for (var a=0; a<temp.length; a++) {
			var app = reset( temp[a] );		
			appId++;
			app.id = appId;
			apps.push( app );
		}		
	}
	catch (e) {
		showError('<load> Apps json file \'' + data.file + '\' is invalid');
		return getError('Apps json file (' + data.file + ') is invalid');
	}
	
	//restartAll();
	
	var message = 'The apps configuration file \'' + data.file + '\' was loaded';
	showInfo( message );
	return getSuccess( null, message );
}

function save( data ) {
	
	var tempApps = [];
	for (var a=0; a<apps.length; a++) {
		var app = apps[a];		
		if (app.name != 'master') {
			tempApps.push(app);
		}
	}	
	
	try {
		fs.writeFileSync(data.file, JSON.stringify(tempApps));		
	}
	catch (e) {
		showError('<save> Unable to create apps json file \'' + data.file + '\'');
    	showError(e.message);
    	return getError('Apps json file (' + data.file + ') cannot be created');		
	}
	
	var message = 'The apps configuration file \'' + data.file + '\' was saved';
	showInfo( message );
	return getSuccess( null, message );
}

function add( app ) {
	
	if (getAppByName( app.name )) {
		showError('<add> App already exists', app.name);
		return getError('App name (' + app.name + ') already exists');
	}
	
	appId++;
	app.id = appId;
	app.name = app.name || 'untitled' + app.id;
	
	apps.push( app );

	showInfo('App succesfully added', app.name);
	return getSuccess( app, 'App (' + app.name + ') succesfully added' );
}

function remove( appToRemove ) {
	
	var app = getAppByName( appToRemove.name );	
	if (!app) {
		showError('<remove> App doesn\'t exists', appToRemove.name);
		return getError('App name (' + appToRemove.name + ') doesn\'t exists');
	}	
	if (app.name == 'master') {
		showError('<remove> App cannot be removed.', app.name);
		return getError('App name (' + app.name + ') cannot be removed');
	}			
	var index = getAppIndex( app.name );
	if (index < 0) {
		showError('<remove> App cannot be found.', app.name);
		return getError('App name (' + app.name + ') cannot be found');
	}
	
	stop( app );
	apps.splice(index, 1);

	showInfo('App succesfully removed.', app.name);
	return getSuccess( null, 'App (' + app.name + ') succesfully removed.' );
}

function set( data ) {
	
	var app = getAppByName( data.search );	
	if (!app) {
		showError('<set> App doesn\'t exists.', data.search);
		return getError('App name (' + data.search + ') doesn\'t exists');
	}	
	if (app.name == 'master') {
		showError('<remove> App cannot be removed.', app.name);
		return getError('App name (' + app.name + ') cannot be removed');
	}
	
	for (var o=0; o<data.options.length; o++) {
		var option = data.options[o];		
		app.name = option.name || app.name;
		app.group = option.group || app.group;		
		if (option.run) {
			app.suid = option.run.user || app.suid;
			app.sgid = option.run.group || app.sgid;			
		}
		app.keep = option.keep || app.keep;
		app.options = option.options || app.options;
		app.attempt = option.attempt || app.attempt;
		app.script = option.script || app.script;
		app.watch.path = option.watch || app.watch.path;
		app.watch.excludes = option.excludes || app.watch.excludes;
		app.files.pid = option.pid || app.files.pid;
		app.files.log = option.log || app.files.log;
		app.host = option.host || app.host;
		app.port = option.port || app.port;
	}
	
	if (app.status == 'online') {
		for (var o=0; o<data.options.length; o++) {
			var option = data.options[o];
			if (option.run ||
				option.script ||
				option.attempt || 
				option.keep ||
				option.options || 
				option.watch || 
				option.excludes ||
				option.interval ||
				option.pid ||
				option.log ||
				option.host ||
				option.port) {
				return restart( app );		
			}
		}
	}
	
	showInfo('App succesfully updated.', app.name);
	return getSuccess( app, 'App (' + app.name + ') succesfully updated' );
}

function get( data ) {
	
	var app = getAppByName( data.search );	
	if (!app) {
		showError('<get> App doesn\'t exists.', data.search);
		return getError('App name (' + data.search + ') doesn\'t exists');
	}
	
	updateAppStats( app );	
	
	showInfo('App properties succesfully retrieved', app.name);
	return getSuccess( app, 'App (' + app.name + ') properties succesfully retrieved' );
}

function list( app ) {		
	
	showInfo('All apps succesfully listed');
	return getSuccess( apps );
}

function monit( app ) {
	
	var stats = [];
	
	for (var a=0; a<apps.length; a++) {
		var app = apps[a];
		if (app.status == 'online') {
			updateAppStats( app );
			stats.push({
				name: app.name,
				pid: app.pid,
				cpu: app.stats.cpu,
				mem: app.stats.memory
			});			
		}	
	}
	
	return getSuccess( stats );
}

/*function isAppStopped( name ) {
	var app = getAppByName( name );
	console.log(app)
	if (app) {
		return app.stopped;
	}
	return false;	
}*/	

function start( appToStart ) {
	
	var app = getAppByName( appToStart.name );	
	if (!app) {
		showError('<start> App doesn\'t exists', appToStart.name);
		return getError('App name (' + appToStart.name + ') doesn\'t exists');
	}
	if (app.name == 'master') {
		showError('<remove> App cannot be started.', app.name);
		return getError('App name (' + app.name + ') cannot be started');
	}
	if (!app.script || app.script == '' || !fs.existsSync(app.script) ) {
		showError('<start> Script file \'' + app.script + '\ doesn\'t exists', app.name);
		return getError('App script (' + app.script + ') doesn\'t exists');
	}	
	if (app.status == 'online') {
		showError('<start> App already running', app.name);
		return getError('App (' + app.name + ') already running');
	}

	var command = settings.bin;
	var args = [];
	if (app.params) {
		args.push( app.params )
	}
	args.push( app.script )
	args.push( app.host )
	args.push( app.port )
	var options = {};

	if (app.uid || app.gid || (app.env && app.env.length > 0)) {
		if (app.env) {
			options.env = {}
			var env = process.env
			for (var name in env) {
			    if (env.hasOwnProperty(name)) {
			        options.env[name] = env[name]
			    }
			}
			for (var e=0; e<app.env.length; e++) {
				var parts = app.env[e].split('=')
				var name = parts[0]
				var value = parts[1]
				if (name && value) {
					options.env[name] = value
				}
			}
			//console.log('env', options.env)
		}
		if (app.gid) {
			options.gid = app.gid;
		}
		if (app.gid) {
			options.gid = app.gid;
		}
	}

	var child = getChildByAppId( app.id );
	if (!child) {
		child = {
			id: app.id,
			proc: null
		};		
		childs.push(child);
	}
	
	try {		
		child.proc = spawn(command, args, options);
		//console.log('proc', child.proc)
	}
	catch (e) {		
		showError('<start> App cannot be started', app.name);
		showError(e.message);
		return getError('App (' + app.name + ') cannot be started');
	}
	
	//child.proc.stdout.pipe(process.stdout);
	//child.proc.stderr.pipe(process.stdout);
	
	// Settings crash management
	if (app.keep) {
		child.proc.on('error', function(code) {
			  showInfo('App crashed with code (' + code + ')', app.name);
			  
			  app.status = 'down';
			  if (!app.stopped) {
				  
				  app.stats.crashed++;				  
				  relaunchApp( app );
			  }
		});
		child.proc.on('close', function(code, signal) {
			  showInfo('App closed with (code:' + code + ') and (signal:' + signal + ')', app.name);
			  
			  app.status = 'down';
		});
		child.proc.on('exit', function(code) {
			  showInfo('App exited with code (' + code + ')', app.name);
			  
			  app.status = 'down';
			  //console.log('exit',isAppStopped(app.name))
			  if (!app.stopped) {
				  
				  relaunchApp( app );
			  }
		});
	}

	app.pid = child.proc.pid;
	
	// Setting pid file
	if (app.files && app.files.pid) {
		
		try {
			fs.writeFileSync(app.files.pid, app.pid);
		}
		catch (e) {
			showError('<start> Unable to create app pid file \'' + app.files.pid + '\'', app.name);
			showError(e.message);
		    return getError('App pid file (' + app.files.pid + ') cannot be created');
		}
		
		showInfo('The pid file \'' + app.files.pid + '\' was created', app.name);
	}
	
	// Setting log file
	if (app.files && app.files.log) {

		app.stdout = fs.createWriteStream(app.files.log, {
			flags: 'a',
			encoding: 'utf8'
		});
		if (!app.stdout) {
			showError('<start> Unable to create app log file \'' + app.files.log + '\'', app.name);
			return getError('App log file (' + app.files.log + ') cannot be created');	
		}		
		
		child.proc.stdout.pipe(app.stdout);
		child.proc.stderr.pipe(app.stdout);
		
		showInfo('The log file \'' + app.files.log + '\' was created', app.name);
	}
	
	// Setting watch timer
	if (app.watch.path) {
		
		if (!app.watch.path || app.watch.path == '' || !fs.existsSync(app.watch.path) ) {
			showError('<start> Watch directory \'' + app.watch.path + '\ doesn\'t exists', app.name);
			return getError('App script (' + app.script + ') doesn\'t exists');
		}
		
		if (app.files) {
			if (app.files.log && !contains(app.watch.excludes, app.files.log)) {
				app.watch.excludes.push(app.files.log);			
			}
			if (app.files.pid && !contains(app.watch.excludes, app.files.pid)) {
				app.watch.excludes.push(app.files.pid);			
			}			
		}
		
		var watcher = watch(app.watch.path, {
		    recursive: true,
		    followSymLinks: false,
		    maxSymLevel: 1
		  },
		  function(filename) {

		  	//console.log('filename:'+filename);
			  
			  var changed = true;
			  if (app.watch.excludes) {				  
				  for (var e=0; e<app.watch.excludes.length; e++) {
					  var exclude = app.watch.excludes[e];
					  //console.log('exclude:'+exclude);
					  if (exclude && filename.match(exclude)) {
						  changed = false;
						  //console.log('match: filename:' + filename + ' exclude: ' + exclude);
						  break;
					  }					  
				  }
			  }
			  
			  if (changed) {
				  showInfo('watch path \'' + filename + '\' has changed', app.name);
				  restart( app );
			  }
			  /*else {
				  console.log(filename, 'ignored.');
			  }*/			  
		});
		
		watchers.push({
			id: app.id,
			watcher: watcher
		});
	}
	
	// Settings app parameters
	app.status = 'online';
	if (!app.attempted) {
		app.curAttempt = 0;
	}
	app.started = new Date().getTime();
	app.stats.started++;
	//setTimeout(function(){
		app.stopped = false;
	//}, 1000);
	
	showInfo('App succesfully started', app.name);
	return getSuccess( app, 'App (' + app.name + ') succesfully started' );
}

function startAll( app ) {
	
	var appCount = 0;
	
	for (var a=0; a<apps.length; a++) {
		var app = apps[a];
		if (app.status == 'down' && app.name != 'master') {		
			var result = start( app );
			if ( !isSuccess( result )) {
				return result;
			}
			appCount++;
		}
	}
	
	var message = appCount + ' app' + (appCount > 1 ? 's' : '') + ' succesfully started';
	
	showInfo(message);
	return getSuccess( null, message );
}

function stop( appToStop ) {	
	
	var app = getAppByName( appToStop.name );	
	if (!app) {
		showError('<stop> App doesn\'t exists', appToStop);
		return getError('App name (' + appToStop.name + ') doesn\'t exists');
	}
	if (app.name == 'master') {
		showError('<remove> App cannot be stoped', app.name);
		return getError('App name (' + app.name + ') cannot be stoped');
	}
	if (app.status == 'down') {
		showError('<stop> App already stopped', app.name);
		return getError('App (' + app.name + ') already stopped');
	}
	var child = getChildByAppId( app.id );
	if (!child) {
		showError('<stop> App cannot be stopped', appToStop);
		return getError('App (' + app.name + ') cannot be stopped');
	}
	
	if (usage.clearHistory) {
		usage.clearHistory(app.pid);
	}
	
	app.status = 'down';
	app.pid = '';
	app.started = 0;
	app.stopped = true;
	app.attempted = false;
	app.stats.stopped++;
	
	if (app.watch && app.watch.enabled) {
		var watcher = getWatcherByAppId( app.id );
		if (watcher) {
			watcher.close();
		}		
	}
	
	if (app.stdout) {
		child.proc.stdout.unpipe(app.stdout);
		child.proc.stderr.unpipe(app.stdout);
		app.stdout.end();
	}		
		
	//console.log('proc0:',child.proc.killed)	
	//['SIGHUP','SIGINT','SIGKILL','SIGTERM'].forEach(function(signal){
		child.proc.kill('SIGTERM');
	//});
	//console.log('proc1:',child.proc.killed)	
	
	if (app.files && app.files.pid) {		
		try {
			fs.unlinkSync(app.files.pid);			
		}
		catch (e) {
			showError('Unable to remove app pid file \'' + app.files.pid + '\'', app.name);
			showError(e.message);
		}		
	}	
	
	showInfo('App succesfully stopped', app.name);
	return getSuccess( app, 'App (' + app.name + ') succesfully stopped' );
}

function stopAll() {
	
	var appCount = 0;
	
	for (var a=0; a<apps.length; a++) {		
		var app = apps[a];
		if (app.name != 'master') {
			if (isSuccess(stop(app))) {
				appCount++;
			}
		}
	}
	
	var message = appCount + ' app' + (appCount > 1 ? 's' : '') + ' succesfully stopped';
	
	showInfo(message);
	return getSuccess( null, message );
}

function restart( app ) {

	if (app.name != 'master') {
	
		stop( app );
		app.stats.restarted++;

		//return start( app );

		setTimeout(function(){
			start( app );
		},1000);

		/*process.nextTick(function(){
			start( app );
		});	*/

		return getSuccess( app, 'App (' + app.name + ') succesfully restarted' );
	}

	showError('<stop> App cannot be stopped', app);
	return getError('App (' + app.name + ') cannot be stopped');
}

function restartAll() {
	
	var appCount = 0;
	
	for (var a=0; a<apps.length; a++) {		
		var app = apps[a];
		if (app.name != 'master') {		
			var result = restart( app );
			if ( !isSuccess( result )) {
				return result;
			}
			appCount++;
		}
	}
	
	var message = appCount + ' app' + (appCount > 1 ? 's' : '') + ' succesfully restarted';
	
	showInfo(message);
	return getSuccess( null, message );
}

module.exports.showLog = showLog;
module.exports.showInfo = showInfo;
module.exports.showError = showError;
module.exports.formatDate = formatDate;
module.exports.load = load;
module.exports.save = save;
module.exports.install = install;
module.exports.uninstall = uninstall;
module.exports.add = add;
module.exports.remove = remove;
module.exports.list = list;
module.exports.monit = monit;
module.exports.set = set;
module.exports.get = get;
module.exports.start = start;
module.exports.startAll = startAll;
module.exports.restart = restart;
module.exports.restartAll = restartAll;
module.exports.stop = stop;
module.exports.stopAll = stopAll;
