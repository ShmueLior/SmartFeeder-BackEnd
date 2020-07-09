require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('./initializers/mongoose');
const passport = require('passport');
require('./initializers/passport');
var flash = require('connect-flash');
var indexRouter = require('./routes/index');
var usersApiRouter = require('./routes/users');
var arduinoApiRouter = require('./routes/arduino');
var dogsApiRouter = require('./routes/dogs');


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/api", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
app.use(flash());
app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/api/v1.0/users', usersApiRouter);
app.use('/api/v1.0/arduino', arduinoApiRouter);
app.use('/api/v1.0/dogs', dogsApiRouter);


module.exports = app;
