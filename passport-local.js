const LocalStrategy = require("passport-local").Strategy;
const db = require("./db");

module.exports = function (passport) {
  async function authUser(username, password, done) {
    console.log(username, password);
    let smokers = await db.Smoker.find();
    console.log(smokers);

    if (username.length < 2) {
      return done(null, false, { message: "invalid username" });
    }
    if (password.length < 2) {
      return done(null, false, { message: "invalid password" });
    }
    let user = {
      username,
      password,
      email: `${username}${(Math.random() * 900) | 0}@g.com`,
    };
    let dbUsers = await db.Smoker.find();
    let filteredUser = dbUsers.filter((u) => u.username === username);
    if (filteredUser.length) {
      console.log("user exists");
      return done(null, { username, password });
    } else {
      let dbUser = await db.Smoker.create(user);
      console.log("new user added");
      return done(null, { username, password });
    }
  }

  passport.use(new LocalStrategy({ usernameField: "username" }, authUser));
  passport.serializeUser((user, done) => done(false, user));
  passport.deserializeUser((user, done) => done(false, user));
};
