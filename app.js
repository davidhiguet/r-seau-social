const express = require("express"),
    User = require("./bdd/user"),
    PrivateMessage = require("./bdd/privateMessage");
    app = express(),  
    bodyParser = require('body-parser'),
    cookieParser = require("cookie-parser"),
    passport = require('passport'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    path = require("path");
    
    //MongoStore = require('connect-mongo')(session);

mongoose.Promise = global.Promise;

//connect to MongoDB
var db_uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/reseau";
mongoose.connect(
  db_uri,
  {
    useMongoClient: true,
    socketTimeoutMS: 0,
    keepAlive: true,
    reconnectTries: 10
  }
).then((db) => {
  console.log('Database connected', db);
  return User.updateMany({}, { $set: { connected: 'notconnected' } });
})
.catch((err) => {
  console.log('Unable to connect to Database', err);
});;






// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));




const server = require("http").Server(app);
const io = require("socket.io")(server);
app.use(
  session({
    secret: "work hard",
    resave: false,
    saveUninitialized: false,
    cookie: {}
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.io = io;
  next();
});

// include routes
var index = require("./routes/index");
var profile = require("./routes/profile");
var mdp = require("./routes/mdp");
var inscription = require("./routes/inscription");

app.use("/", index);
app.use("/profile", profile);
app.use("/mdp", mdp);
app.use("/inscription", inscription);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports =   { app: app, server: server };