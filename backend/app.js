var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// const db = require('./db')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var roomsRouter = require('./routes/rooms')
var hotelsRouter = require('./routes/hotels')
const jwt =require('jsonwebtoken')
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

//set up mongoose
const mongoose = require('mongoose');

function mongooseSetup() {
  mongoose.connect(process.env.MDB_CONNECT,{
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  mongoose.connection.on('connected', function(){
    console.info('Connected to MongoDB successful');
  })

  mongoose.connection.on('error',function(err){
    console.error('Mongoose default connection has occured ' + err + ' error');
  })

  mongoose.connection.on('disconnected', function(){
    console.warn('Database connection is disconnected');
  })

  process.on('SIGINT', function(){
    mongoose.connection.close(function(){
        console.log(termination('Database connection is disconnected due to application termination'));
        process.exit(0);
    })
  })
}

mongooseSetup();

//Middleware để xác thực token
function authentication(req,res,next){
  const token = req.header('Authorization')
  if(!token) return res.status(401).json({message:'Authorization'})
  jwt.verify(token, process.env.JWT_SECRET, (err,user)=>{
    if(err) return res.status(403).json({message:'Forbidden'})
    req.user = user
    next();
  })
}

// Middleware để kiểm tra role
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).send('Forbidden');

    next();
  };
};

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/rooms', roomsRouter);
app.use('/hotels', hotelsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
