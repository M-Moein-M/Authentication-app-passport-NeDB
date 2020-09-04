const express = require('express');

// app
const app = express();

// database
const Datastore = require('nedb');
const database = new Datastore({ filename: 'database.db', autoload: true });

// handlebars
const exphbs = require('express-handlebars');
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// passport initialization
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

const initializePassport = require('./passport-config');
initializePassport(passport, database);

app.use(require('method-override')('_method'));
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
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

// listening to port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to port ${port}`));

// using middlewares for requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// rendering homepage
app.use(express.static('public'));

// home
app.get('/', (req, res) => res.render('home', { style: 'home.css' }));

// register
app.get('/register', checkNotAuthenticated, (req, res) =>
  res.render('register', { style: 'register.css' })
);

app.post('/register', checkNotAuthenticated, (req, res) => {
  if (!req.body.name || !req.body.password) {
    // invalid request redirecting to register page
    console.log('invalid request');
  }
  bcrypt.hash(req.body.password, 10, (err, encryptedPass) => {
    const user = {
      name: req.body.name,
      password: encryptedPass,
    };
    database.insert(user);
    console.log(`${user.name} just registered`);
    req.flash('login_message', 'You can log in now');
    res.status(200).redirect('/secret'); // user can login to account
  });
});

// secret
app.get('/secret', checkAuthenticated, (req, res) => {
  res.render('secret', { style: 'secret.css' });
});

// login
app.get('/login', checkNotAuthenticated, (req, res) =>
  res.render('login', { style: 'login.css' })
);

app.post(
  '/login',
  checkNotAuthenticated,
  passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login',
  })
);

// logout
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});
