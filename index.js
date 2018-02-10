require('exit-on-epipe');
var express = require('express');
var app = express();
app.set('views', './views');
app.set('view engine', 'jade');
var http = require('http').Server(app);

// var io = require('socket.io')(http);
var Server = require('socket.io');
var io = new Server(http, {
    path: '/socket-py-learn'
});

app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

var cp = require('child_process');
var pusage = require('pidusage');
function PythonDialog () {

    var ctl = this;

    ctl.commands = [];
    ctl.reply = '';
    ctl._runCommands = -1; // total commands has been run (current program), for error report usage..., minus the first empty command
    ctl._processedCommandsInBlock = 0;  // total commands has been processed in block like for...:, for error report usage

    var _initCP = function () {
        ctl.childProcess = cp.spawn('python', ['-i']);
        ctl.childProcess.stdout.setEncoding('utf8');
        ctl.childProcess.stderr.setEncoding('utf8');
        ctl.childProcess.stdout.on('data', function(data) {

            if(ctl._deadloop) {
                return;
            }

            //if(!ctl._testEnterCount) {
            //    ctl._testEnterCount = 0;
            //    ctl._lastTime = new Date().getTime();
            //}
            //ctl._testEnterCount++;
            //console.log('%%%%%%%%%%>>> ctl._testEnterCount: ' + ctl._testEnterCount);
            //console.log('%%%%%%%%%%>>> time passes: ' + (new Date().getTime() - ctl._lastTime));

            // Note: you don't know how many times call into here for one command
            // data = data.replace(new RegExp('<', 'g'), '&lt;').replace(new RegExp('>', 'g'), '&gt;');
            if(ctl.reply.slice(-4).trim() === '>>>') {
                ctl.reply = ctl.reply.slice(0, -4) + data + '>>> ';
            } else {
                ctl.reply += data;
            }

            // [ Detect dead looping...
            if(!ctl._dataBeginTime) {
                ctl._dataBeginTime = new Date().getTime();
                ctl._triggerDataCountWithinShortTime = 0;
            }
            if(new Date().getTime() - ctl._dataBeginTime < 100) {
                ctl._triggerDataCountWithinShortTime++;
                if(ctl._triggerDataCountWithinShortTime > 100) {
                    ctl.reply += '\nYou may enter a dead looping!!!\nSession will be closed and re-initialized...\n\n';
                    ctl.childProcess.kill();
                    ctl._deadloop = true;
                    setTimeout(function () {
                        _initCP();
                        setTimeout(function () {
                            ctl._triggerDataCountWithinShortTime = 0;
                            ctl._deadloop = false;
                        }, 200);
                    }, 100);
                }
            } else {
                ctl._dataBeginTime = null;
                ctl._triggerDataCountWithinShortTime = 0;
            }
            // Detect dead looping...]
        });
        ctl.childProcess.stderr.on('data', function(data) {
            if((data.trim() !== '>>>' || ctl.commands.length === 0) && (data.trim() !== '...' || (data.trim() === '...' && ctl.commands.length === 0))) {
                ctl.reply += data;
                ctl.commands = [];
            } else {
                if(data.trim() === '...') {
                    ctl._processedCommandsInBlock++;
                } else {
                    ctl._processedCommandsInBlock = 0;
                }
                try {
                    ctl.childProcess.stdin.write(ctl.commands.shift().trimRight()+'\n');
                    ctl._runCommands++;
                } catch (e) {
                    console.log('catched error continuing run commands: ' + e.message);
                }
            }
        });
        ctl.childProcess.on('close', function (code) {
            console.log('Exited with code: ' + code);
        });

        var _overSomePercentTimes = 0; // times checked that cpu usage keeps over 90%
        clearInterval(ctl._monitor);
        ctl._monitor = setInterval(function () {
            pusage.stat(ctl.childProcess.pid, function (err, stat) {
                if(!stat) {
                    // ctl.childProcess already exited
                    clearInterval(ctl._monitor);
                    console.log('stat undefined...');
                    return;
                }
                // console.log('Pcpu: %s', stat.cpu);
                // console.log('Mem: %s', stat.memory);
                if(stat.cpu > 10) {
                    _overSomePercentTimes++;
                    if(_overSomePercentTimes >= 3) {
                        _overSomePercentTimes = 0;
                        clearInterval(ctl._monitor);
                        ctl.childProcess.kill();
                        setTimeout(function () {
                            if(ctl.reply.trim() !== '') {
                                ctl.reply = '\nYou may had entered a dead looping!!!\nSession was closed and re-initialized...\n\n'
                            }
                            _initCP();
                        }, 100);
                    }
                } else {
                    _overSomePercentTimes = 0;
                }
            });
        }, 1000);
    };

    _initCP();

    ctl.getReply = function () {
        var rpl = ctl.reply;
        ctl.reply = '';
        var lineNo = ctl._runCommands;
        if(lineNo !== -1) {
            var pre_pattern = 'File "<stdin>", line ';
            var re = new RegExp(pre_pattern + '[0-9]+', 'g');
            var match = re.exec(rpl);
            var returnErrLine = null;
            if(match && match[0]) {
                returnErrLine = parseInt(match[0].substr(pre_pattern.length, match[0].length), 10);
            }
            if(lineNo > returnErrLine && returnErrLine !== 1) {
                // error happen in block, and before the block has been successfully run
                rpl = rpl.replace(re, pre_pattern + (lineNo - ctl._processedCommandsInBlock - 1 + returnErrLine));
            } else {
                rpl = rpl.replace(re, pre_pattern + lineNo);
            }
        }
        if(ctl.commands.length === 0) {
            ctl._runCommands = -1;
            ctl._processedCommandsInBlock = 0;
        }
        return rpl.replace(new RegExp(' ', 'g'), '&nbsp;').replace(new RegExp('<', 'g'), '&lt;').replace(new RegExp('>', 'g'), '&gt;');
    };

    ctl.run = function (pg) {
        if(pg && pg.length) {
            ctl.commands = [''].concat(pg.split('\n'));
            if(ctl.commands.length) {
                try {
                    ctl.childProcess.stdin.write(ctl.commands.shift().trimRight() + '\n');
                    ctl._runCommands++;
                } catch (e) {
                    console.log('catched error in run: ' + e.message);
                }
            }
        }
    };

    return ctl;
}

app.get('/', function (req, res) {
    res.sendFile(__dirname+'/public/index.html');
});

var programs = require('./routers/programs');
app.use('/progs', programs);

function initProcess (socket, cb) {
    socket.__python_dialog = new PythonDialog();
    setTimeout(function() {
        socket.emit('reply', socket.__python_dialog.getReply());
        if(cb) {
            cb();
        }
    }, 200)
}

io.on('connection', function(socket) {
    console.log('==> a user connected');
    console.log('==> Client IP: ' + socket.handshake.headers['client-ip']);
    console.log('==> Browser: ' + socket.handshake.headers['user-agent']);
    socket.on('init', function() {
        initProcess(socket);
    });
    socket.on('command', function(command) {
        console.log('\n-------- ' + new Date() + ' --------');
        console.log(command + '\n\n');
        try {
            socket.__python_dialog.childProcess.stdin.write((command || '').trimRight() + '\n');
        } catch (e) {
            console.log('catched error runing a user command: ' + e.message);
            socket.emit('reply', '>>>&nbsp;');
            return;
        }
        setTimeout(function() {
            if(socket.__python_dialog) {
                //if(socket.__python_dialog._deadloop) {
                //    // dead loop with output
                //    setTimeout(function () {
                //        socket.emit('reply', socket.__python_dialog.getReply());
                //    }, 5000);
                //} else {
                var _rpl = socket.__python_dialog.getReply();
                if(_rpl.trim() === '' && command.trim().indexOf('exit') < 0) {
                    // dead loop with no output
                    setTimeout(function () {
                        _rpl = '\nYou may had entered a dead looping!!!\nSession was closed and re-initialized...\n\n';
                        socket.emit('reply', _rpl);
                    }, 5000);
                } else {
                    socket.emit('reply', _rpl);
                }
                //}
            }
        }, 200);
    });
    socket.on('program', function(pg) {
        console.log('\n======= ' + new Date() + ' =======\n');
        console.log(pg + '\n');
        try {
            socket.__python_dialog.run(pg);
            __getReply();
        } catch (e) {
            console.log(e.message);
            initProcess(socket, function () {
                socket.__python_dialog.run(pg);
                __getReply();
            });
        }
        function __getReply() {
            setTimeout(function() {
                socket.emit('reply', '\n######## RESULT ########\n' + socket.__python_dialog.getReply());
            }, 200);
        }
    });
    socket.on('disconnect', function() {
        console.log('--> user disconnected');
        if(socket.__python_dialog && socket.__python_dialog.childProcess) {
            try {
                socket.__python_dialog.childProcess.stdin.write('\n');
                socket.__python_dialog.childProcess.stdin.write('exit()\n');
            } catch (e) {
                console.log('catched error when user disconnect destroy.' + e.message);
            }
        }
    });
});

http.listen(3003, function(){
    console.log('Listening on 3003');
});



// =====================================================================================================================
//var myPythonScriptPath = './py-scripts/test.py';
//var PythonShell = require('python-shell');
//var pyshell = new PythonShell(myPythonScriptPath, {
//    mode: 'text'
//});
//
//// sends a message to the Python script via stdin
//pyshell.send();
//
//pyshell.on('message', function (message) {
//    // received a message sent from the Python script (a simple "print" statement)
//    console.log(message);
//});
//
//// end the input stream and allow the process to exit
//pyshell.end(function (err) {
//    if (err) throw err;
//    console.log('finished');
//});

//function run_cmd(cmd, args, cb, end) {
//    var spawn = require('child_process').spawn,
//        child = spawn(cmd, args),
//        me = this;
//    child.stdout.on('data', function (buffer) { cb(me, buffer) });
//    child.stdout.on('end', end);
//}

// Run C:\Windows\System32\netstat.exe -an
//var foo = new run_cmd(
//    'netstat.exe', ['-an'],
//    function (me, buffer) { me.stdout += buffer.toString() },
//    function () { console.log(foo.stdout) }
//);

//var foo = new run_cmd(
//    'dir', ['/B'],
//    function (me, buffer) { me.stdout += buffer.toString(); },
//    function () { console.log(foo.stdout) }
//);

//var sys = require('sys');
//var exec = require('child_process').exec;
//function puts(error, stdout, stderr) { sys.puts(stdout) }
////exec("ls -la", function (error, stdout, stderr) {
////    console.log(stdout);
////});
//exec("dir", puts);

//var exec = require('child_process').exec;
//exec("ls", function (error, stdout, stderr) {
//    console.log(stdout);
//});
//exec("python", function (error, stdout, stderr) {
//    console.log(stdout);
//});


//const { spawn } = require('child_process');
//const ls = spawn('python', []);
//
//ls.stdout.on('data', (data) => {
//    console.log(`stdout: ${data}`);
//});
//
//ls.stderr.on('data', (data) => {
//    console.log(`stderr: ${data}`);
//});
//
//ls.on('close', (code) => {
//    console.log(`child process exited with code ${code}`);
//});

// with express 3.x
//var express = require('express');
//var app = express();
//app.use(express.logger('dev'));
//app.use(express.bodyParser());
//app.use(app.router);
//app.post('/upload', function(req, res){
//    if(req.files.myUpload){
//        var python = require('child_process').spawn(
//            'python',
//            // second argument is array of parameters, e.g.:
//            ["/home/me/pythonScript.py"
//                , req.files.myUpload.path
//                , req.files.myUpload.type]
//        );
//        var output = "";
//        python.stdout.on('data', function(data){ output += data });
//        python.on('close', function(code){
//            if (code !== 0) {
//                return res.send(500, code);
//            }
//            return res.send(200, output);
//        });
//    } else { res.send(500, 'No file found') }
//});
//
//require('http').createServer(app).listen(3000, function(){
//    console.log('Listening on 3000');
//});


//var express = require('express');
//var app = express();
//var myPythonScriptPath = './py-scripts/test.py';
//app.get('/', function(req, res){
//    var python = require('child_process').spawn(
//        "python",
//        // second argument is array of parameters, e.g.:
//        [myPythonScriptPath]
//    );
//    var output = "";
//    python.stdout.on('data', function(data){ output += data; });
//    python.on('close', function (code) {
//        console.log(code);
//        //if (code !== 0) {
//        //    return res.status(500).send('error: ' + code);
//        //}
//        return res.send(output);
//    });
//});
//
//app.listen(3000, function(){
//    console.log('Listening on 3000');
//});