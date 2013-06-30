Supervizer ![Travis Status](https://travis-ci.org/oOthkOo/supervizer.png)
========================
A NodeJS daemon process manager to spawn/start/stop node app .

![List command](https://raw.github.com/oOthkOo/supervizer/master/screenshots/supervizer-list.png)

Features
-----
 * Start/Stop/Restart a node process
 * Group any node process
 * Start/Stop/Restart a node group process
 * Programable crash process management
 * Monitoring resources (restart count, uptime, memory, cpu etc..) for every process
 * Full RESTfull API management via HTTP
 * LOG files process management
 * PID files process management
 * User execution process management
 * Load/Save all node process configuration from/to json file

Usage
-----
``` sh
  supervizer.js [command] <options>

  Commands:

    help <command>     print required/allowed options for each command.
    install            install supervizer as daemon
    load               load from a app configuration json file
    save               save to a app configuration json file
    add                add a node app
    remove             delete a node app
    start              start a new node app
    startAll           start all node app
    stop               stop a node app
    stopAll            stop all node apps
    restart            restart a node app
    restartAll         restart all node apps
    list               list all node apps
    monit              monitor all node apps
    set <name>         setting process property value
    get <name> <param> getting process property value
    *                 

  Options:

    -h, --help                    output usage information
    -V, --version                 output the version number
    -v --verbose                  display verbose data
    -f --force                    force supervizer actions
    -n --name <string>            specify app name
    -r --run <user:group>         specify user to run app
    -g --group <string>           specify app group
    -s --script <path>            specify app main script
    -l --log <file>               specify app log output file
    -t --pid <file>               specify app pid file
    -w --watch <path>             specify path to watch
    -i --interval <milliseconds>  specify interval in milliseconds for watch
    -e --exclude <path>           specify path to exclude
    -h --host <address>           specify host to bind
    -p --port <port>              specify port to bind
    -a --auth <user:password>     specify user/password to use
    -c --config <file>            specify config file to load
```

API endpoints
-----
Supervizer daemon has an RESTfull http interface wich allow you to control it remotely ;-)

| COMMANDs        | VERBs       | URIs            | Descriptions                      |
| ----------------|-------------|-----------------|-----------------------------------|   						
|				          | GET   		  | /		            | Show server banner                |
| load		        |	GET		 	    | /config/load		| Load all apps from file           |
| save		        |	PUT		    	| /config/save		| Save all apps to file             |
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
| get			        | POST		    | /app			      |	Get an app property               |

 


