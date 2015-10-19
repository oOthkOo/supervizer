Supervizer ![Travis Status](https://travis-ci.org/oOthkOo/supervizer.png)
========================
[![NPM](https://nodei.co/npm/supervizer.png?downloads=true)](https://nodei.co/npm/supervizer/)

A NodeJS manager to spawn/stop/manage node application.

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
``` sh
  supervizer-master
```
![Get command](https://raw.github.com/oOthkOo/supervizer/master/screenshots/supervizer-master-log.png)

Features
-----
 * Start/Stop/Restart a node application
 * Grouping applications
 * Start/Stop/Restart a application group
 * Hot change application parameters (env, host, port, logs) in realtime ;-)
 * Keep alive/Restart a application when it crash
 * Monitoring application resources (restart count, uptime, memory, cpu etc..)
 * Watch directories/files changes to restart application
 * Full RESTfull API management via HTTP/S
 * Application LOG files process management
 * Application PID files process management
 * User execution process management by uid:gid
 * Load/Save all application configurations from/to JSON config file
 
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
To install supervizer master as a daemon/service :

  On Linux :

  With Sysvinit - (https://help.ubuntu.com/community/UbuntuBootupHowto).<br />
  With Upstart - (http://upstart.ubuntu.com/getting-started.html).<br />
  With Systemd - (https://wiki.ubuntu.com/SystemdForUpstartUsers).

Configuration (apps)
-----
To make your nodeJS Application fully compatible with Supervizer, you must follow this code example to retrieve host and port parameters :
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

server.listen(port, host);
console.log('Listening on port ' + port);
```
Usage (Summary)
-----
Add your application :
``` sh
  supervizer add --name myApp --group myGroup --script /path/to/script.js 
  --host localhost --port 3000 --watch /path/to/watch --log /path/to/logfile.log
```
Start your application :
``` sh
  supervizer start --name myApp
```
Stop your application :
``` sh
  supervizer stop --name myApp
```
Update your application parameters :
``` sh
  supervizer set myApp --port 3001
```
Save all your applications :
``` sh
  supervizer save --config /path/to/apps.json
```
Load all your applications :
``` sh
  supervizer load --config /path/to/apps.json
```
Start all your applications :
``` sh
  supervizer startAll  
```
Start all applications by group:
``` sh
  supervizer startAll --group myGroup
```
Disable your application :
``` sh
  supervizer disable myApp 
```
Security (Authentication)
-----
Enable authentication mode :
``` sh
  supervizer secure enable --auth myNewUserName:myNewPassword
```
Restart your application with authentication :
``` sh
  supervizer restart --name myApp --auth myUserName:myPassword
```
Disable authentication mode :
``` sh
  supervizer secure disable --auth myUserName:myPassword
```
Update your credentials :
``` sh
  supervizer secure disable --auth myOldUserName:myOldPassword
  supervizer secure enable --auth myNewUserName:myNewPassword
```
Usage (Complete)
-----
``` sh
  supervizer [command] <options>

  Commands:

    install                install supervizer as daemon
    uninstall              uninstall supervizer as daemon
    load                   load all applications from a JSON config file
    save                   save all applications to a JSON config file
    add                    add an application
    remove                 remove an application
    start                  start an application
    startAll               start all applications
    stop                   stop an application
    stopAll                stop all applications
    restart                restart an application
    restartAll             restart all applications
    list                   list all applications
    monit                  monitor all applications
    secure                 create/update/remove security authentication
    enable <name>          enable an application
    enableAll              enable all applications
    disable <name>         disable an application
    disableAll             disable all applications
    set <name>             setting application property value
    get <name>             getting application properties values

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -v --verbose                display verbose data
    -n --name <string>          specify application name
    -z --env <string>           specify comma separated environment variables
    -x --params <string>        specify node command line extra parameters
    -r --run <user:group>       specify user uid:gid to run application
    -g --group <string>         specify application group
    -s --script <path>          specify application main script
    -l --log <file>             specify application log output file
    -t --pid <file>             specify application pid file
    -k --keep <yes/no>          keep alive application (default:yes)
    -t --attempt <number>       max restart to keep alive (default:3)
    -w --watch <path>           specify path to watch
    -e --exclude <regex,regex>  specify regexes to exclude paths
    -h --host <address>         specify address to bind
    -p --port <port>            specify port to bind
    -a --auth <user:password>   specify user/password to use
    -c --config <file>          specify JSON config file to load/save
```

API endpoints
-----
Supervizer master server has an RESTfull HTTP interface wich allow you to control it remotely ;-)

| COMMANDs        | VERBs       | URIs            | Descriptions                      |
| ----------------|-------------|-----------------|-----------------------------------|   						
|				          | GET   		  | /		            | Show server banner                |
| load		        |	POST	 	    | /config/load		| Load all applications from file   |
| save		        |	POST	    	| /config/save		| Save all applications to file     |
| add		          |	PUT		      | /apps				    | Add an application to run         |
| remove	        |	DELETE	    |	/apps				    | Stop and Remove an application    |
| start		        | POST		    | /app/start			| Start an application              |
| startAll        |	POST		    | /apps/start		  | Start all applications            |
| stop            |	POST		    | /app/stop		    | Stop an application               |
| stopAll		      | POST		    | /apps/stop			| Stop all applications             |
| restart		      | POST	     	| /app/restart	  | Restart an application            |
| restartAll	    | POST	    	| /apps/restart	  | Restart all applications          |
| list			      | POST	    	| /apps/list		  |	List all applications             |
| monit		        | POST		    | /apps/monit     |	Monitor all applications          |
| list            | POST        | /secure         | enable/disable authentication     |
| enable          | POST        | /app/enable     | Enable an application             |
| enableAll       | POST        | /apps/enable    | Enable all applications           |
| disable         | POST        | /app/disable    | Disable an application            |
| disableAll      | POST        | /apps/disable   | Disable all applications          |
| set			        | POST		    | /app			      |	Set an application property		    |	
| get			        | GET		      | /app			      |	Get an application property       |

TODOs (commands)
-----
Theses commands actually doesn't work, but you can install easily
Supervizer master as a service by Systemd, Upstart, Sysvinit or other.
     
    * install
    * uninstall
