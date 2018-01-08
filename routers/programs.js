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

router.get('/tutorial/:pgId', function (req, res, next) {
    // TODO: connect mongoDB to retrieve program
    res.send('print "TODO: ' + req.params.pgId + '"');
});

router.post('/tutorial/:pgId', function (req, res, next) {
    // todo: check user, connect mongoDB to save program
});

router.get('/basic-libs/:pgId', function (req, res, next) {
    // TODO: connect mongoDB to retrieve program
    res.send('print "TODO: ' + req.params.pgId + '"');
});

router.post('/basic-libs/:pgId', function (req, res, next) {
    // todo: check user, connect mongoDB to save program
});

module.exports = router;