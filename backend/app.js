require('dotenv').config();
const cors = require('cors');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');


var usersRouter = require('./routes/users');

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

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => console.log("Connection Established with MongoDB Database"))
  .catch((err) => console.error("Error connecting to Database:", err.message));

// MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("Database Connected");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB Database connection error:", error.message);
});

module.exports = app;
