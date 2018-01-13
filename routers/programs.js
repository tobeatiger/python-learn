var express = require('express');
var router = express.Router();

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

router.use(bodyParser.json({limit: '50mb'}));
router.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
router.use(cookieParser());
router.use(session({
    secret: 'my secret key tobeatiger ww',
    resave: false,
    saveUninitialized: false
}));
router.use(function (req, res, next) {  // todo: proper settings???
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

// ====================== mongoose ======================
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Program', {
    useMongoClient: true
});
var Program = mongoose.model('Program', {
    category: String,
    pgId: String,
    pgDesc: String,
    pgValue: String
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    //cryptPassword('**********', function (err, hash) {
    //    var jim = new UserDocuments({
    //        userName: 'admin',
    //        userId: 'admin',
    //        userPassword: hash
    //    });
    //    jim.save(function (err) {
    //        if(err) {
    //            console.log(err);
    //        } else {
    //            console.log('saved!');
    //        }
    //    });
    //});
    console.log('Mongo connected!!!');
});
// ====================== mongoose ======================

//router.get('/', function (req, res) {
//    res.render('programs.jade', {});
//});

var UserDocuments = mongoose.model('User', {
    userName: String,
    userId: String,
    userPassword: String
});
var bcrypt = require('bcrypt-nodejs');
var cryptPassword = function (password, cb) {
    bcrypt.hash(password, null, null, function (err, hash) {
        if(err) {
            return cb(err);
        }
        return cb(err, hash);
    });
};
var comparePassword = function (password, userPassword, cb) {
    bcrypt.compare(password, userPassword, function (err, res) {
        if(err) {
            return cb(err);
        }
        return cb(null, res);
    });
};
var checkUser = function (req, res, next) {
    if(req.session.user) {
        next();
    } else {
        res.status(403);
        res.send('Not authorised');
    }
};

router.get('/', function(req, res) {
    if(req.session.user) {
        res.render('programs.jade', {});
    } else {
        res.render('login-poc.jade', {});
    }
});

router.post('/', function(req, res, next) {
    if(!req.body.user || !req.body.password) {
        res.status('400');
        res.send('Invalid post!');
    } else {
        console.log('Authentication...');
        if(mongoose.connection.readyState != 1) { // not connected
            res.status(500).render('login-poc.jade', {message: 'Database not connected!'})
        } else {
            UserDocuments.findOne({userId: req.body.user}).exec(function (err, user) {
                if(err) {
                    console.log(err);
                    res.status(500).render('login-poc.jade', {message: 'Unexpected error!'});
                } else {
                    if(!user) {
                        res.status(404);
                        res.render('login-poc.jade', {message: 'Invalid user name!'});
                    } else {
                        comparePassword(req.body.password, user.userPassword, function(err, match) {
                            if(match) {
                                user.userPassword = undefined; //never expose the user password, even it's encrypt
                                req.session.user = user;
                                res.redirect('./progs');
                            } else {
                                res.status('403');
                                res.render('login-poc.jade', {message: 'Wrong password!'})
                            }
                        });
                    }
                }
            });
        }
    }
});

router.get('/list', function (req, res) {
    Program.find().sort([['category', -1]]).exec(function(err, pgs) {
        if(err) {
            console.log(err);
            res.status(500).send('failed');
            return;
        }
        res.send(pgs);
    });
});

router.post('/update', checkUser, function (req, res, next) {
    if(req.body._id) {
        Program.update({ _id: req.body._id }, {
            $set: req.body
        }, {}, function (err, doc) {
            if(err) {
                console.log(err);
                res.status(500).send('failed');
                return;
            }
            res.send('ok');
        });
    } else {
        new Program(req.body).save().then(function () {
            console.log('Saved successfully!!!');
            res.send('ok');
        }).catch(function (reason) {
            console.log(reason);
            res.status(500).send('failed');
        });
    }
});

router.delete('/:id', checkUser, function (req, res, next) {
    Program.remove({ _id: req.params.id }, function (err) {
        if(err) {
            console.log(err);
            res.status(500).send('failed');
            return;
        }
        res.send('ok');
    });
});

module.exports = router;