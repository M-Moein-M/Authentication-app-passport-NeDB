const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, database) {
  const authenticateUser = async (name, password, done) => {
    database.findOne({ name: name }, async (err, user) => {
      if (err) throw err;
      if (user == null) {
        done(null, false, { message: 'No user with such email' });
      }

      try {
        if (await bcrypt.compare(password, user.password)) {
          done(null, user);
        } else {
          done(null, false, { message: 'Password incorrect' });
        }
      } catch (e) {
        return done(e);
      }
    });
  };
  passport.use(new LocalStrategy({ usernameField: 'name' }, authenticateUser));

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser((id, done) => {
    database.findOne({ _id: id }, (err, user) => {
      if (err) throw err;
      return done(null, user);
    });
  });
}

module.exports = initialize;
