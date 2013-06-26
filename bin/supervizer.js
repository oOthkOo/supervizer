#!/usr/bin/env node

const SPZ_SUCCESS_EXIT = 0;
const SPZ_ERROR_EXIT   = 1;

var commander = require('commander');
var fs = require('fs');
var path = require('path');
var util = require('util');
var cliTable = require('cli-table');
var watch = require('watch');
var package = require('../package.json');
var settings = require('../settings.json');

function spz_error( message ) {
	console.log('\n\033[31m  [ERROR]: ' + message + '\x1B[39m');
}

function spz_info( message ) {
	console.log('\n\033[34m  [INFO]: ' + message + '\x1B[39m');
}

commander.version(package.version)
	.option('-v --verbose', 'display verbose data')
	.option('-f --force', 'force supervizer actions')
	.option('-o --output <path>', 'specify log output file')
	.option('-e --error <path>', 'specify error log output file')
	.usage('[command] app');

commander.command('start <script>')
	.description('start specific part')
	.action(function(script) {

	console.log( 'verbose: ' + (commander.verbose ? 'yes' : 'no'));
	console.log( 'pid: ' + commander.pid);
	console.log( 'args: ' + commander.args);
	console.log( 'script: ' + script );
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



