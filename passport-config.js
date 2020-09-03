const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByName, getUserById) {
  const authenticateUser = async (name, password, done) => {
    getUserByName({ name: name }, (err, user) => {
      if (err) throw err;

      console.log(user);

      if (user == null)
        // if the user was not found
        return done(null, false, {
          message: 'User with such username was not found',
        });

      try {
        bcrypt.compare(password, user.password, (err, passwordMatched) => {
          if (passwordMatched) return done(null, user);
          else return done(null, false, { message: 'Password incorrect' });
        });
      } catch (error) {
        return done(error);
      }
    });
  };

  passport.use(new LocalStrategy({ usernameField: 'name' }, authenticateUser));

  passport.serializeUser((name, done) => {
    getUserByName({ name: name }, (err, user) => {
      if (err) throw err;
      return done(null, user._id);
    });
  });
  passport.deserializeUser((id, done) => {
    getUserById({ _id: id }, (err, user) => {
      if (err) throw err;
      return done(null, user);
    });
  });
}

module.exports = initialize;
