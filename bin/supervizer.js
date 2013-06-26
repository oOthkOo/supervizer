#!/usr/bin/env node

const SPZ_SUCCESS_EXIT = 0;
const SPZ_ERROR_EXIT   = 1;

var fs = require('fs');
var path = require('path');
var util = require('util');
var cliTable = require('cli-table');
var watch = require('watch');
var package = require('../package.json');
var settings = require('../settings.json');
var commander = require('commander');

function spz_error( message ) {
	console.log('\n\033[31m  [ERROR]: ' + message + '\x1B[39m');
}

function spz_info( message ) {
	console.log('\n\033[34m  [INFO]: ' + message + '\x1B[39m');
}

var procs = [];

var np = {
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

commander.version(package.version)
	.option('-v --verbose', 'display verbose data')
	.option('-f --force', 'force supervizer actions')
	.option('-n --name <string>', 'specify process name')
	.option('-u --user <string>', 'specify process username')
	.option('-g --group <string>', 'specify process group')
	.option('-s --script <path>', 'specify process main script')
	.option('-l --log <file>', 'specify process log output file')
	.option('-t --pid <file>', 'specify process pid file')
	.option('-w --watch <path>', 'specify path to watch')
	.option('-i --interval <milliseconds>', 'specify interval in milliseconds for watch')
	.option('-e --exclude <path>', 'specify path to exclude')
	.option('-h --host <address>', 'specify host to bind')
	.option('-p --port <port>', 'specify port to bind')
	.option('-c --config <file>', 'specify config file to load')
	.usage('[command] <options>');

commander.command('install')
	.description('install supervizer as daemon')
	.action(function() {
});

commander.command('load')
	.description('load from a process configuration json file')
	.action(function() {

	console.log('verbose: ' + (commander.verbose ? 'yes' : 'no'));
	console.log('config: ' + commander.config);
});

commander.command('save')
	.description('save to a process configuration json file')
	.action(function() {
});

commander.command('add')
	.description('add a node process')
	.action(function() {
});

commander.command('remove')
	.description('delete a node process')
	.action(function() {
});

commander.command('start')
	.description('start a new node process')
	.action(function() {
});

commander.command('startAll')
	.description('start all node process')
	.action(function() {
});

commander.command('stop')
	.description('stop a node process')
	.action(function() {
});

commander.command('stopAll')
	.description('stop all node process')
	.action(function() {
});

commander.command('restart')
	.description('restart a node process')
	.action(function() {
});

commander.command('restartAll')
	.description('restart all node process')
	.action(function() {
});

commander.command('list')
	.description('list all node process')
	.action(function() {
});

commander.command('monit')
	.description('monitor all node process')
	.action(function() {
});

commander.command('set <name>')
	.description('setting process property value')
	.action(function(name) {


	






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



