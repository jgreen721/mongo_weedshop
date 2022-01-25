const LocalStrategy = require("passport-local").Strategy;
const db = require("./db")


module.exports = function(passport){

    async function authUser(username,password,done){
        console.log(username,password);
        let smokers = await db.Smoker.find();
        console.log(smokers)

        if(username.length < 2){
            return done(null,false,{message:"invalid username"})
        }
        if(password.length < 2){
            return done(null,false,{message:"invalid password"})
        }
        return done(null,{username,password})
    }

    passport.use(new LocalStrategy({usernameField:"username"},authUser))
    passport.serializeUser((user,done)=>done(false,user))
    passport.deserializeUser((user,done)=>done(false,user))
}