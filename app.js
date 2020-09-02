const express = require('express');
const Datastore = require('nedb');

// create app
const app = express();

// create database
const database = new Datastore({ filename: 'database.db' });
database.loadDatabase((err) => {
  if (err) throw err;
  console.log('Database loaded');
});

// using handlebars
const exphbs = require('express-handlebars');
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// passport initialization
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

const initializePassport = require('./passport-config');
initializePassport(
  passport,
  (name) => database.findOne({ name: name }),
  (id) => database.findOne({ _id: id })
);

console.log(database.findOne({ name: 'king' }));

app.use(flash());
app.use(
  session({
    secret: 'just-some-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect('/login');
}
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) res.redirect('/');
  else next();
}

// listening to port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to port ${port}`));

// using middlewares for requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// rendering homepage
app.use(express.static('public'));

// for diffrent styling we pass in the css file name to style the page in addition to syle.css(default) file
app.get('/', (req, res) => res.render('home', { style: 'home.css' }));

// handle register requests
app.get('/register', checkNotAuthenticated, (req, res) =>
  res.render('register', { style: 'register.css' })
);

app.post('/register', checkNotAuthenticated, (req, res) => {
  if (!req.body.name || !req.body.password) {
    // invalid request redirecting to register page
    res.status(400).redirect('/register');
  }
  bcrypt.hash(req.body.password, 10, (err, encryptedPass) => {
    database.insert({ name: req.body.name, password: encryptedPass });
    console.log(`${req.body.name} added to database`);
    res.status(200).redirect('/secret'); // user can login to account
  });
});

// handle secret requests
app.get('/secret', checkAuthenticated, (req, res) => {
  res.render('secret', { style: 'secret.css' });
});

// handle login requests
app.get('/login', checkNotAuthenticated, (req, res) =>
  res.render('login', { style: 'login.css' })
);

app.post(
  '/login',
  checkNotAuthenticated,
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/secret');
  }
);
