const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByName, getUserById) {
  const authenticateUser = async (name, password, done) => {
    const user = getUserByName(name);
    if (user == null)
      // if the user was not found
      return done(null, false, {
        msg: 'User with such username was not found',
      });

    try {
      if (bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { msg: 'Password incorrect' });
      }
    } catch (error) {
      done(error);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'name' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser((id, done) => done(null, getUserById(id)));
}

module.exports = initialize;
