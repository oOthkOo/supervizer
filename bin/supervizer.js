#!/usr/bin/env node

const SPZ_SUCCESS_EXIT = 0;
const SPZ_ERROR_EXIT   = 1;

/**
 * Require all modules
 */
var common = require('../lib/common');
var main = require('../lib/main');
var path = require('path');
var Table = require('cli-table');
var commander = require('commander');
var request = require('request');

/**
 * Setting all modules
 */

/*request.defaults( {
	json: true
});*/

/**
 * Settings all global variables
 */
var serverHost = common.settings.host + ':' + common.settings.port + '/';

/**
 * All private functions
 */
function showError( message ) {
	console.log('\n\033[31m  [ERROR]: ' + message + '\x1B[39m\n');
}

function showHttpError( code ) {
	var message = '';
	switch (code) {
		case 500:
			message = '(Network:' + code + ') - Internal server error occured.';
			break;
		case 401:
			message = '(Auth:' + code + ') - Invalid username or password.';
			break;
		case 404:
			message = '(System:' + code + ') - Invalid command for this server.';
			break;
		case 700:
			message = '(Network:' + code + ') - Unable to connect to the server.';
			break;
		default:
			message = '(System:' + code + ') - An unknow error occured.';
			break;
	}	
	showError( message );
}

function showInfo( message ) {
	console.log('\n\033[32m  [INFO]: ' + message + '\x1B[39m\n');
}

function isQueryValid(error, response, body) {
	
	if (!response) {
		showHttpError( 700 );
		return null;
	}
	if (error || response.statusCode != 200) {
		showHttpError( response.statusCode );
		return null;
	}
	
	var query = body || false;
	if (!query) {
		showHttpError( 701 );
		return null;
	}
	
	if (query.result != common.results.SPZ_OK) {		
		showError( query.error );		
		return null;
	}	
	
	return query;
}

function getAppPattern() {	
	return {
		id: '',
		name: commander.name || '',
		group: commander.group || 'main',
		uid: commander.run ? commander.run.split(':')[0] : '',
		gid: commander.run ? commander.run.split(':')[1] : '',
		script: commander.script || '',
		created: new Date().getTime(),
		watch: {
			enabled: commander.watch ? true : false,
			interval: commander.interval || 2000,
			path: commander.watch || '',
			excludes: commander.exclude || []
		},
		files: {
			pid: commander.pid || '',
			log: commander.log || ''
		},
		host: commander.host || '',
		port: commander.port || '',
		pid: '',
		keepAlive: commander.keepAlive == 'yes' ? true : false,
		status: 'down',
		stats: {
			uptime: 0,
			started: 0,
			crashed: 0,
			stopped: 0,
			restarted: 0,
			memory: 0,
			cpu: 0
		}
	}
}

function getRequestParams( uri, data ) {
	return {
		url: serverHost + uri,
		headers: { 'Content-type': 'application/json' },
		body: data,
		json: true
	}
}

function listFormat( type, value ) {
	switch (type) {
		case 'script':
			return value ? path.basename(value) : 'N/C';
		case 'memory':
			return value ? getHumanBytes( value ) : 'N/C';
		case 'uptime':
			return value || 'N/C';
		case 'pid':
			return value || 'N/C';
		case 'host':
			return value ? value.replace('http://',''): 'N/C';
		case 'status':
			return value;
		case 'port':
			return value || 'N/C';
		default:
			return value;
	}
	return '';
}

function showAppList( apps ) {
	
	if ( !apps || apps.length < 1 ) {
		showInfo( 'No apps found.');
		return;
	}
	
	var table = new Table({
	    head: ['id', 'name', 'pid','script', 'group', 'status', 'host', 'port', 'mem', 'uptime'],
	    colWidths: [5, 15, 8, 15, 10, 8, 20, 9, 8, 8]
	    
	});
	
	for (var a=0; a<apps.length; a++) {
		var app = apps[a];
		table.push([
		     listFormat('id', app.id),
		     listFormat('name', app.name),
		     listFormat('pid', app.pid),
		     listFormat('script', app.script),
		     listFormat('group', app.group),
		     listFormat('status', app.status),
		     listFormat('host', app.host),
		     listFormat('port', app.port),
		     listFormat('memory', app.stats.memory),
		     listFormat('uptime', app.stats.uptime)
		]);
	}

	console.log(table.toString());
}

function getHumanBytes(bytes, precision) {
	var kilobyte = 1024;
	var megabyte = kilobyte * 1024;
	var gigabyte = megabyte * 1024;
	var terabyte = gigabyte * 1024;

	if ((bytes >= 0) && (bytes < kilobyte)) {
		return bytes + ' B';
	}
	else if ((bytes >= kilobyte) && (bytes < megabyte)) {
	    return (bytes / kilobyte).toFixed(precision) + ' KB';
	}
	else if ((bytes >= megabyte) && (bytes < gigabyte)) {
	    return (bytes / megabyte).toFixed(precision) + ' MB';
	}
	else if ((bytes >= gigabyte) && (bytes < terabyte)) {
		return (bytes / gigabyte).toFixed(precision) + ' GB';
	}
	else if (bytes >= terabyte) {
		return (bytes / terabyte).toFixed(precision) + ' TB';
	}
	else {
	    return bytes + ' B';
	}
};

function getCommandOptions() {
	var options = [];
	if (typeof commander.force != 'undefined') {
		options.push({ 
			force: commander.force
		});
	}
	if (typeof commander.name != 'undefined') {
		options.push({ 
			name: commander.name
		});
	}
	if (typeof commander.run != 'undefined') {
		options.push({ 
			run: {
				user: commander.run.split(':')[0],
				group: commander.run.split(':')[1]
			}
		});
	}
	if (typeof commander.group != 'undefined') {
		options.push({ 
			group: commander.group
		});
	}
	if (typeof commander.script != 'undefined') {
		options.push({ 
			script: commander.script
		});
	}
	if (typeof commander.log != 'undefined') {
		options.push({ 
			log: commander.log
		});
	}
	if (typeof commander.pid != 'undefined') {
		options.push({ 
			pid: commander.pid
		});
	}
	if (typeof commander.host != 'undefined') {
		options.push({ 
			host: commander.host
		});
	}
	if (typeof commander.keepAlive != 'undefined') {
		options.push({ 
			keepAlive: commander.keepAlive == 'yes' ? true : false
		});
	}
	if (typeof commander.watch != 'undefined') {
		options.push({ 
			watch: commander.watch
		});
	}
	if (typeof commander.interval != 'undefined') {
		options.push({ 
			interval: commander.interval
		});
	}
	if (typeof commander.exclude != 'undefined') {
		options.push({ 
			exclude: commander.exclude
		});
	}
	if (typeof commander.port != 'undefined') {
		options.push({ 
			port: commander.port
		});
	}
	if (typeof commander.auth != 'undefined') {
		options.push({ 
			auth: {
				user: commander.auth.split(':')[0],
				password: commander.auth.split(':')[1]
			}
		});
	}
	if (typeof commander.config != 'undefined') {
		options.push({ 
			config: commander.config
		});
	}
	return options;
}

/**
 * Setting all commands
 */
commander.version(common.pkg.version)
	.option('-v --verbose', 'display verbose data')
	.option('-f --force', 'force supervizer actions')
	.option('-n --name <string>', 'specify app name')
	.option('-r --run <user:group>', 'specify user to run app')
	.option('-g --group <string>', 'specify app group')
	.option('-s --script <path>', 'specify app main script')
	.option('-l --log <file>', 'specify app log output file')
	.option('-t --pid <file>', 'specify app pid file')
	.option('-k --keep <yes/no)', 'keep alive app (default:yes)')
	.option('-w --watch <path>', 'specify path to watch')
	.option('-i --interval <milliseconds>', 'specify interval in milliseconds for watch')
	.option('-e --exclude <path>', 'specify path to exclude')
	.option('-h --host <address>', 'specify host to bind')
	.option('-p --port <port>', 'specify port to bind')
	.option('-a --auth <user:password>', 'specify user/password to use')
	.option('-c --config <file>', 'specify config file to load')
	.usage('[command] <options>');

commander.command('help <command>')
.description('print required/allowed options for each command.')
.action(function() {
	
});

commander.command('install')
	.description('install supervizer as daemon')
	.action(function() {
		
		if (process.getuid() != 0) {
			showError('You must run supervizer as root for this command.');
			process.exit(SPZ_ERROR_EXIT);
		}		
});

commander.command('load')
	.description('load from a process configuration json file')
	.action(function() {
});

commander.command('save')
	.description('save to a process configuration json file')
	.action(function() {
});

commander.command('add')
	.description('add a node process')
	.action(function() {	
		
		var app = getAppPattern();		
		var params = getRequestParams( 'apps', JSON.stringify(app) );
		
		//console.log( '[send]:\n' + ' - url: ' + params.url + '\n - data: ' + JSON.stringify(app) + '\n' );
		
		request.post( params, function(error, response, body){
			//console.log( '[receive]:\n - data: ' + JSON.stringify(body));
			
			var query = isQueryValid(error, response, body);
			if (!query) {
				process.exit(SPZ_ERROR_EXIT);
			}
			else {
				showInfo(query.success);
			}
			
		});
});

commander.command('remove')
	.description('delete a node process')
	.action(function() {
});

commander.command('start')
	.description('start a new node process')
	.action(function() {
		
		var app = getAppPattern();		
		var params = getRequestParams( 'app/start', JSON.stringify(app) );
		
		//console.log( '[send]:\n' + ' - url: ' + params.url + '\n - data: ' + JSON.stringify(app) + '\n' );
		
		request.post( params, function(error, response, body){
			//console.log( '[receive]:\n - data: ' + JSON.stringify(body));
			
			var query = isQueryValid(error, response, body);
			if (!query) {
				process.exit(SPZ_ERROR_EXIT);
			}
			else {
				showInfo(query.success);
			}
			
		});
});

commander.command('startAll')
	.description('start all node process')
	.action(function() {
		
		var app = getAppPattern();		
		var params = getRequestParams( 'apps/start', JSON.stringify(app) );
		
		//console.log( '[send]:\n' + ' - url: ' + params.url + '\n - data: ' + JSON.stringify(app) + '\n' );
		
		request.post( params, function(error, response, body){
			//console.log( '[receive]:\n - data: ' + JSON.stringify(body));
			
			var query = isQueryValid(error, response, body);
			if (!query) {
				process.exit(SPZ_ERROR_EXIT);
			}
			else {
				showInfo(query.success);
			}
			
		});
});

commander.command('stop')
	.description('stop a node process')
	.action(function() {
		
		var app = getAppPattern();		
		var params = getRequestParams( 'app/stop', JSON.stringify(app) );
		
		//console.log( '[send]:\n' + ' - url: ' + params.url + '\n - data: ' + JSON.stringify(app) + '\n' );
		
		request.post( params, function(error, response, body){
			//console.log( '[receive]:\n - data: ' + JSON.stringify(body));
			
			var query = isQueryValid(error, response, body);
			if (!query) {
				process.exit(SPZ_ERROR_EXIT);
			}
			else {
				showInfo(query.success);
			}
			
		});
});

commander.command('stopAll')
	.description('stop all node process')
	.action(function() {
		
		var app = getAppPattern();		
		var params = getRequestParams( 'apps/stop', JSON.stringify(app) );
		
		//console.log( '[send]:\n' + ' - url: ' + params.url + '\n - data: ' + JSON.stringify(app) + '\n' );
		
		request.post( params, function(error, response, body){
			//console.log( '[receive]:\n - data: ' + JSON.stringify(body));
			
			var query = isQueryValid(error, response, body);
			if (!query) {
				process.exit(SPZ_ERROR_EXIT);
			}
			else {
				showInfo(query.success);
			}
			
		});
});

commander.command('restart')
	.description('restart a node process')
	.action(function() {
		
		var app = getAppPattern();		
		var params = getRequestParams( 'app/restart', JSON.stringify(app) );
		
		//console.log( '[send]:\n' + ' - url: ' + params.url + '\n - data: ' + JSON.stringify(app) + '\n' );
		
		request.post( params, function(error, response, body){
			//console.log( '[receive]:\n - data: ' + JSON.stringify(body));
			
			var query = isQueryValid(error, response, body);
			if (!query) {
				process.exit(SPZ_ERROR_EXIT);
			}
			else {
				showInfo(query.success);
			}
			
		});
});

commander.command('restartAll')
	.description('restart all node process')
	.action(function() {
		
		var app = getAppPattern();		
		var params = getRequestParams( 'apps/restart', JSON.stringify(app) );
		
		//console.log( '[send]:\n' + ' - url: ' + params.url + '\n - data: ' + JSON.stringify(app) + '\n' );
		
		request.post( params, function(error, response, body){
			//console.log( '[receive]:\n - data: ' + JSON.stringify(body));
			
			var query = isQueryValid(error, response, body);
			if (!query) {
				process.exit(SPZ_ERROR_EXIT);
			}
			else {
				showInfo(query.success);
			}
			
		});
});

commander.command('list')
	.description('list all node process')
	.action(function() {
		
	var app = getAppPattern();	
	var params = getRequestParams( 'apps/list', JSON.stringify(app) );
	
	//console.log( '[send]:\n' + ' - url: ' + params.url + '\n - data: ' + JSON.stringify(app) + '\n' );
	
	request.post( params, function(error, response, body){
		//console.log( '[receive]:\n - data: ' + JSON.stringify(body));
		
		var query = isQueryValid(error, response, body);
		if (!query) {
			process.exit(SPZ_ERROR_EXIT);
		}
		showAppList( query.data );
		
	});
		
});

commander.command('monit')
	.description('monitor all node process')
	.action(function() {
});

commander.command('set <name>')
	.description('setting process property value')
	.action(function(name) {

		var data = {
				search: name,
				app: getAppPattern(),
				options: getCommandOptions()
		}		
		var params = getRequestParams( 'app', JSON.stringify(data) );
		
		//console.log( '[send]:\n' + ' - url: ' + params.url + '\n - data: ' + JSON.stringify(app) + '\n' );
		
		request.post( params, function(error, response, body){
			//console.log( '[receive]:\n - data: ' + JSON.stringify(body));
			
			var query = isQueryValid(error, response, body);
			if (!query) {
				process.exit(SPZ_ERROR_EXIT);
			}
			else {
				showInfo(query.success);
			}
			
		});

});

commander.command('get <name> <param>')
	.description('getting process property value')
	.action(function(name,param) {

	console.log('name: ' + name);
	console.log('param: ' + param);
});


commander.command('*')
	.action(function() {
	spz_info('Command not found.');
	commander.outputHelp();
	process.exit(SPZ_ERROR_EXIT);
});

if (process.argv.length == 2) {
	commander.parse(process.argv);
	commander.outputHelp();
	process.exit(SPZ_ERROR_EXIT);
}

//console.log( 'process.argv.length: ' + process.argv.length );
commander.parse(process.argv);
