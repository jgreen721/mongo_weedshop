const router = require('express').Router();
const passport = require("passport");
const db = require("../db")

require("../passport-local.js")(passport)



router.get("/",(req,res)=>{
        res.redirect("/login")
})

router.get("/login",(req,res,next)=>{
    if(req.isAuthenticated()){
       return res.redirect("/dashboard")
    }
    next()
 } ,(req,res)=>{
    res.render("login")
})

router.get("/dashboard",(req,res,next)=>{
    if(!req.isAuthenticated()){
       return res.redirect("/login")
    }
    next()
 } ,(req,res)=>{
    res.render("dashboard")
})


router.post("/login",passport.authenticate("local",{
    successRedirect:"/dashboard",
    failureFlash:true,
    failureRedirect:"/login"
}))


module.exports = router;