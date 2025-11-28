var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");

require("./database");

var indexRouter = require('./routes/index');
const userRoutes = require("./routes/userRoutes");
var registerRouter = require('./routes/register');
var adminRouter = require('./routes/admin');
const subAdminRoutes = require('./routes/SubAdminRoutes');
const loginRoute = require("./routes/userlogin");
const transactionsRouter = require("./routes/Transactions");
const staffRoutes = require("./routes/staffRoutes");


var app = express();
const cors = require("cors");

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({
  secret: "superSecretKey",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Add this for localhost HTTP
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/register', registerRouter);
app.use('/admin',adminRouter);
app.use("/api/subadmin", subAdminRoutes);  
app.use("/api/users",userRoutes );
app.use("/api/userlogin", loginRoute);
app.use("/api/transactions", transactionsRouter);
app.use("/api", staffRoutes);
app.use(cors());



// ❌ REMOVE HOME ROUTE FROM HERE
// Home route is now handled inside routes/index.js ONLY

// catch 404
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

