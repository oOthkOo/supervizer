#!/usr/bin/env node

var common = require('../lib/common');
var main = require('../lib/main');
var express = require('express');
var server = express();

server.disable('x-powered-by');
server.use(express.bodyParser());
//server.use(express.logger());

/**
 * API endpoints
 * 
 * COMMANDs		VERBs		URIs				Descriptions
 * 
 * 				GET   		/					Show server banner
 * load			POST		/config/load		Load all apps from file
 * save			POST		/config/save		Save all apps to file
 * add			POST		/apps				Add an app to run
 * remove		DELETE		/apps				Stop and Remove an app
 * start		POST		/app/start			Start an app
 * startAll		POST		/apps/start			Start all apps
 * stop			POST		/app/stop			Stop an app
 * stopAll		POST		/apps/stop			Stop all apps
 * restart		POST		/app/restart		Restart an app
 * restartAll	POST		/apps/restart		Restart all apps
 * list			POST		/apps/list			Get app state list
 * monit		POST		/apps/monit			Monitor all apps
 * set			POST		/app				Set an app property			
 * get			POST		/app				Get an app property
 */

/**
 * GET /
 */
server.get('/', function(req, res) {  	
	res.end('Supervizer server v' + common.pkg.version);
});

/**
 * GET /config/load
 */
server.post('/config/load', function(req, res) {  	
		
	//console.log( '[request]:\n' + ' - path: /config/load\n - receive: ' + JSON.stringify(req.body) + '\n' );
	
	res.end(JSON.stringify(main.load(req.body)));
});

/**
 * POST /config/save
 */
server.post('/config/save', function(req, res) {  	
		
	//console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' );
	
	res.end(JSON.stringify(main.save(req.body)));
});

/**
 * POST /apps
 */
server.post('/apps', function(req, res) {  	
		
	//console.log( '[request]:\n' + ' - path: /apps\n - receive: ' + JSON.stringify(req.body) + '\n' );
	
	res.end(JSON.stringify(main.add(req.body)));
});

/**
 * POST /app
 */
server.post('/app', function(req, res) {  	
		
	//console.log( '[request]:\n' + ' - path: /app\n - receive: ' + JSON.stringify(req.body) + '\n' );
	
	res.end(JSON.stringify(main.set(req.body)));
});

/**
 * POST /app/start
 */
server.post('/app/start', function(req, res) {  	
		
	//console.log( '[request]:\n' + ' - path: /app/start\n - receive: ' + JSON.stringify(req.body) + '\n' );
	
	res.end(JSON.stringify(main.start(req.body)));
});

/**
 * POST /apps/start
 */
server.post('/apps/start', function(req, res) {  	
		
	//console.log( '[request]:\n' + ' - path: /apps/start\n - receive: ' + JSON.stringify(req.body) + '\n' );
	
	res.end(JSON.stringify(main.startAll(req.body)));
});

/**
 * POST /app/restart
 */
server.post('/app/restart', function(req, res) {  	
		
	//console.log( '[request]:\n' + ' - path: /app/restart\n - receive: ' + JSON.stringify(req.body) + '\n' );
	
	res.end(JSON.stringify(main.restart(req.body)));
});

/**
 * POST /apps/restart
 */
server.post('/apps/restart', function(req, res) {  	
		
	//console.log( '[request]:\n' + ' - path: /apps/restart\n - receive: ' + JSON.stringify(req.body) + '\n' );
	
	res.end(JSON.stringify(main.restartAll(req.body)));
});

/**
 * POST /app/stop
 */
server.post('/app/stop', function(req, res) {  	
		
	//console.log( '[request]:\n' + ' - path: /app/stop\n - receive: ' + JSON.stringify(req.body) + '\n' );
	
	res.end(JSON.stringify(main.stop(req.body)));
});

/**
 * POST /apps/stop
 */
server.post('/apps/stop', function(req, res) {  	
		
	//console.log( '[request]:\n' + ' - path: /apps/stop\n - receive: ' + JSON.stringify(req.body) + '\n' );
	
	res.end(JSON.stringify(main.stopAll(req.body)));
});

/**
 * POST /apps/list
 */
server.post('/apps/list', function(req, res) {
	
	//console.log( '[request]:\n' + ' - path: /apps/list\n - receive: ' + JSON.stringify(req.body) + '\n' );
	
	res.end(JSON.stringify(main.list(req.body)));
});

server.get('*', function(req, res) {
  	res.send('Not Found!', 404);
});

server.use(function(err, req, res, next) {  	
  	res.send('Something broke!', 500);
	console.error(err.stack);
});

process.on('close', function(code) {
	main.showInfo('Supervizer server stopped.');
});

server.listen(common.settings.port);
main.showInfo('Supervizer server started.');
