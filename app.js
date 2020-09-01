const express = require('express');
const bcrypt = require('bcrypt');
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
app.get('/register', (req, res) =>
  res.render('register', { style: 'register.css' })
);

app.post('/user/add', (req, res) => {
  console.log(req.body.name);
  console.log(req.body.password);

  bcrypt.hash(req.body.password, 10, (err, encryptedPass) => {
    database.insert({ name: req.body.name, password: encryptedPass });
    console.log(`${req.body.name} added to database`);
  });

  res.redirect('/');
});
