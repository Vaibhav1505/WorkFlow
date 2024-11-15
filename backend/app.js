require('dotenv').config();
const cors = require('cors');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const databaseConfigs = require('./database/databaseConnection');

const usersRouter = require('./routes/users');
const taskRouter = require('./routes/tasks')

var app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Define routes
app.use('/users', usersRouter);
app.use('/tasks', taskRouter);

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.use(express.static(path.join(__dirname, '../frontend/build')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

// Postgres Database connection
async function initializeDatabase() {
  try {
    await databaseConfigs.connectDatabase();
    console.log("Database Connnection established successfully")
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}
initializeDatabase();



module.exports = app;
