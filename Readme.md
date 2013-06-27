Supervizer
========================
A NodeJS daemon process manager to spawn/start/stop node app.

![Travis Status](https://travis-ci.org/oOthkOo/supervizer.png)

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

    install            install supervizer as daemon
    load               load from a process configuration json file
    save               save to a process configuration json file
    add                add a node process
    remove             delete a node process
    start              start a new node process
    startAll           start all node process
    stop               stop a node process
    stopAll            stop all node process
    restart            restart a node process
    restartAll         restart all node process
    list               list all node process
    monit              monitor all node process
    set <name>         setting process property value
    get <name> <param> getting process property value
    *                 

  Options:

    -h, --help                    output usage information
    -V, --version                 output the version number
    -v --verbose                  display verbose data
    -f --force                    force supervizer actions
    -n --name <string>            specify process name
    -u --user <string>            specify process username
    -g --group <string>           specify process group
    -s --script <path>            specify process main script
    -l --log <file>               specify process log output file
    -t --pid <file>               specify process pid file
    -w --watch <path>             specify path to watch
    -i --interval <milliseconds>  specify interval in milliseconds for watch
    -e --exclude <path>           specify path to exclude
    -h --host <address>           specify host to bind
    -p --port <port>              specify port to bind
    -c --config <file>            specify config file to load
```


