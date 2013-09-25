Supervizer ![Travis Status](https://travis-ci.org/oOthkOo/supervizer.png)
========================
[![NPM](https://nodei.co/npm/supervizer.png?downloads=true)](https://nodei.co/npm/supervizer/)

A NodeJS daemon process manager to spawn/start/stop node app .

``` sh
  supervizer list
```
![List command](https://raw.github.com/oOthkOo/supervizer/master/screenshots/supervizer-list.png)
``` sh
  supervizer monit
```
![Monit command](https://raw.github.com/oOthkOo/supervizer/master/screenshots/supervizer-monit.png)
``` sh
  supervizer get myApp
```
![Get command](https://raw.github.com/oOthkOo/supervizer/master/screenshots/supervizer-get.png)

Features
-----
 * Start/Stop/Restart a node process
 * Group any node process
 * Start/Stop/Restart a node group process
 * Hot change node process host, port, logs in live ;-)
 * Keep alive/Restart a node process when it crash
 * Monitoring resources (restart count, uptime, memory, cpu etc..) for every process
 * Watch directories/files management to restart process
 * Full RESTfull API management via HTTP
 * LOG files process management
 * PID files process management
 * User execution process management by uid:gid
 * Load/Save all node process configuration from/to json file
 
Installation (module)
-----
To install node supervizer module from npm repository :
``` sh
  npm install -g supervizer
```
Or from source:
``` sh
  git clone git://github.com/oOthkOo/supervizer.git 
  cd supervizer
  npm link -g
```
And run this command to start supervizer master server :

``` sh
  supervizer-server
```
Installation (master)
-----
To install supervizer master as daemon, you must run this command as root :
``` sh
  sudo supervizer --install
```
Configuration (apps)
-----
To make your process compatible with Supervizer, you must follow this code example to retrieve host and port parameters :
``` js
var host = process.argv[2] || '0.0.0.0';
var port = process.argv[3] || '5000';
```
For example, if you use expressjs framework :
``` js
var express = require('express');
var server = express();

server.use(express.static(__dirname + '/public'));
server.use(express.logger());

server.get('/', function(req, res) {  	
	res.end('Hello word!');
});

server.get('*', function(req, res) {
  	res.send('Not Found!', 404);
});

server.use(function(err, req, res, next) {  	
  	res.send(500, 'Something broke!');
	console.error(err.stack);
});

var host = process.argv[2] || '0.0.0.0';
var port = process.argv[3] || '5000';

server.listen(port,host);
console.log('Listening on port ' + port);
```
Usage (Summary)
-----
Add your app :
``` sh
  supervizer add --name myApp --group myGroup --script /path/to/script.js 
  --host localhost --port 3000 --watch /path/to/watch --log /path/to/logfile.log
```
Start your app :
``` sh
  supervizer start --name myApp
```
Stop your app :
``` sh
  supervizer stop --name myApp
```
Update your app :
``` sh
  supervizer set myApp --port 3001
```
Save all your apps :
``` sh
  supervizer save --config /path/to/apps.json
```
Load your apps :
``` sh
  supervizer load --config /path/to/apps.json
```
Start all your apps :
``` sh
  supervizer startAll  
```
Usage (Complete)
-----
``` sh
  supervizer [command] <options>

  Commands:

    help <command>         print required/allowed options for each command.
    install                install supervizer as daemon
    uninstall              uninstall supervizer as daemon
    load                   load from a process configuration json file
    save                   save to a process configuration json file
    add                    add a node process
    remove                 remove a node process
    start                  start a new node process
    startAll               start all node process
    stop                   stop a node process
    stopAll                stop all node process
    restart                restart a node process
    restartAll             restart all node process
    list                   list all node process
    monit                  monitor all node process
    set <name>             setting process property value
    get <name>             getting process properties values

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -v --verbose                display verbose data
    -f --force                  force supervizer actions
    -n --name <string>          specify app name
    -r --run <user:group>       specify user to run app
    -g --group <string>         specify app group
    -s --script <path>          specify app main script
    -l --log <file>             specify app log output file
    -t --pid <file>             specify app pid file
    -k --keep <yes/no>          keep alive app (default:yes)
    -t --attempt <number>       max restart to keep alive (default:3)
    -w --watch <path>           specify path to watch
    -e --exclude <regex,regex>  specify regexes to exclude paths
    -h --host <address>         specify address to bind
    -p --port <port>            specify port to bind
    -a --auth <user:password>   specify user/password to use
    -c --config <file>          specify config file to load/save
```

API endpoints
-----
Supervizer daemon has an RESTfull http interface wich allow you to control it remotely ;-)

| COMMANDs        | VERBs       | URIs            | Descriptions                      |
| ----------------|-------------|-----------------|-----------------------------------|   						
|				          | GET   		  | /		            | Show server banner                |
| load		        |	POST	 	    | /config/load		| Load all apps from file           |
| save		        |	POST	    	| /config/save		| Save all apps to file             |
| add		          |	POST		    | /apps				    | Add an app to run                 |
| remove	        |	DELETE	    |	/apps				    | Stop and Remove an app            |
| start		        | POST		    | /app/start			| Start an app                      |
| startAll        |	POST		    | /apps/start		  | Start all apps                    |
| stop            |	POST		    | /app/stop		    | Stop an app                       |
| stopAll		      | POST		    | /apps/stop			| Stop all apps                     |
| restart		      | POST	     	| /app/restart	  | Restart an app                    |
| restartAll	    | POST	    	| /apps/restart	  | Restart all apps                  |
| list			      | POST	    	| /apps/list		  |	Get app state list                |
| monit		        | POST		    | /apps/monit     |	Monitor all apps                  |
| set			        | POST		    | /app			      |	Set an app property		            |	
| get			        | GET		    | /app			      |	Get an app property

TODOs (commands)
-----
Theses commands actually doesn't work
     
    * help
    * install
    * uninstall
	
 TODOs (options)
-----
Theses options actually doesn't work
	
	* force
	* run
	* auth
	

