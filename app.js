const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const redis = require("connect-redis");
const loggerMorgan = require('morgan');
const http = require('http');
const indexRouter = require('./routes/index');
const config = require("./config");
const log4js = require("./lib/log");
const logger = log4js.logger("app");
const ErrorCode = require("./lib/ErrorCode");
require('body-parser-xml')(bodyParser);
const app = express();
// view engine setup
//跑批次
// scheduleList.onehours();
// scheduleList.clearUserSign();
const RedisStore=redis(session);
const redisStores=new RedisStore({
    host:config.redis_host,
    port:config.redis_port,
    db:config.redis_session_db,
    prefix:'Fengge'
});

app.use(bodyParser.xml({
    limit: '2MB',   // Reject payload bigger than 1 MB
    xmlParseOptions: {
      normalize: true,     // Trim whitespace inside text nodes
      normalizeTags: true, // Transform tags to lowercase
      explicitArray: false // Only put nodes in array if >1
    }
  }));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.engine("html",require("ejs").renderFile);
app.set('view engine', 'html');
app.use(loggerMorgan('dev'));
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb',extended:true}));
app.use(cookieParser());
app.use(session({
        secret: 'wei',
        cookie:{maxAge: 1000*60*60*24},
        resave:true,
        store:redisStores,
        saveUninitialized: true
    })
);
process.on('message',function(code){
    console.log(code);
});
app.use("*", function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With,token");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    if (req.method === 'OPTIONS') {
        res.sendStatus(200)
    } else {
        next()
    }
});
app.use('/', indexRouter);
// app.use('/app/', appRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//记录错误日志
app.use(function (err, req, res, next) {
    let status = err.status || 500;
    logger.error('【error】', 'status:', status, 'message:', err.message || '');
    logger.error('【stack】\n ', err.stack || '');
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // res.status(err.status || 500);
  //   res.json({
  //       code: ErrorCode.SystemError,
  //       msg: err.message
  //   });
  res.render('error');
});
module.exports = app;

