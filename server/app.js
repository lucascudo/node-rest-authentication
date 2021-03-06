const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const config = require('config');

const subjectRoutes = require('./modules/subject/subject_routes');
const userRoutes = require('./modules/user/user_routes');
const app = express();

mongoose.Promise = global.Promise;
if (process.env.NODE_ENV === 'test') {
    let Mockgoose = require('mockgoose').Mockgoose;
    let mockgoose = new Mockgoose(mongoose);
    mockgoose.prepareStorage().then(() => {
        mongoose.connect(config.databaseUri, {useMongoClient: true});
    });
} else {
    mongoose.connect(config.databaseUri, {useMongoClient: true});
}

if (config.util.getEnv('NODE_ENV') !== 'test') {
    app.use(logger('combined')); //'combined' outputs the Apache style LOGs
}

app
.use(logger('dev'))
.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})
.use(passport.initialize())
.use(bodyParser.json())
.use(bodyParser.urlencoded({ extended: true }))
.use(fileUpload())
.use(cookieParser())
.use(express.static(path.join(__dirname, 'public')))
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// view engine setup
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'jade')
// custom routes
.get('/', (req, res) => res.redirect(config.uriRoot))
.get(config.uriRoot + '/', (req, res) => res.render('index', { title: config.title }))
.use(config.uriRoot, userRoutes)
.use(config.uriRoot + '/subject', subjectRoutes)
// catch 404 and forward to error handler
.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
})
// error handler
.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
