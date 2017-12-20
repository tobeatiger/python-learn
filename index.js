var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

var cp = require('child_process');

function PythonDialog () {

    this.childProcess = cp.spawn('python', ['-i']);
    this.childProcess.stdout.setEncoding('utf8');
    this.childProcess.stderr.setEncoding('utf8');

    this.commands = [];
    this.reply = '';
    var ctl = this;
    this.childProcess.stdout.on('data', function(data) {
        // data = data.replace(new RegExp('<', 'g'), '&lt;').replace(new RegExp('>', 'g'), '&gt;');
        if(ctl.reply.slice(-4).trim() === '>>>') {
            ctl.reply = ctl.reply.slice(0, -4) + data + '>>> ';
        } else {
            ctl.reply += data;
        }
    });
    this.childProcess.stderr.on('data', function(data) {
        if((data.trim() !== '>>>' || ctl.commands.length === 0) && (data.trim() !== '...' || (data.trim() === '...' && ctl.commands.length === 0))) {
            ctl.reply += data;
            ctl.commands = [];
        } else {
            ctl.childProcess.stdin.write(ctl.commands.shift().trimRight()+'\n');
            ctl._runCommands++;
        }
    });
    this.childProcess.on('close', function (code) {
        console.log('Exited with code: ' + code);
    });

    this.getReply = function () {
        var rpl = ctl.reply;
        ctl.reply = '';
        var lineNo = ctl._runCommands;
        if(ctl.commands.length === 0) {
            ctl._runCommands = -1;
        }
        if(lineNo !== -1) {
            rpl = rpl.replace(new RegExp('File "<stdin>", line [0-9]+', 'g'), 'File "<stdin>", line ' + lineNo);
        }
        return rpl.replace(new RegExp(' ', 'g'), '&nbsp;').replace(new RegExp('<', 'g'), '&lt;').replace(new RegExp('>', 'g'), '&gt;');
    };

    this._runCommands = -1; // total commands has been run (current program), for error report usage..., minus the first empty command
    this.run = function (pg) {
        if(pg && pg.length) {
            ctl.commands = [''].concat(pg.split('\n'));
            if(ctl.commands.length) {
                ctl.childProcess.stdin.write(ctl.commands.shift().trimRight() + '\n');
                ctl._runCommands++;
            }
        }
    };

    return this;
}

app.get('/', function (req, res) {
    res.sendFile(__dirname+'/public/index.html');
});

function initProcess (socket, cb) {
    socket.__python_dialog = new PythonDialog();
    setTimeout(function() {
        socket.emit('reply', socket.__python_dialog.getReply());
        if(cb) {
            cb();
        }
    }, 200)
}

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('init', function() {
        initProcess(socket);
    });
    socket.on('command', function(command) {
        console.log('\n-------- ' + new Date() + ' --------');
        console.log(command + '\n\n');
        socket.__python_dialog.childProcess.stdin.write((command || '').trimRight() + '\n');
        setTimeout(function() {
            if(socket.__python_dialog) {
                socket.emit('reply', socket.__python_dialog.getReply());
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
        console.log('user disconnected');
        if(socket.__python_dialog && socket.__python_dialog.childProcess) {
            try {
                socket.__python_dialog.childProcess.stdin.write('\n');
                socket.__python_dialog.childProcess.stdin.write('exit()\n');
            } catch (e) {
                console.log(e.message);
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
