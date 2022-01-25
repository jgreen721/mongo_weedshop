const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport')
const routes = require("./routes");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 4455;

app.set("view engine","ejs")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin:admin@crudcluster.zjkmt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority").then(res=>{
    console.log("mongo connected")
})

app.use(flash())
app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:false,
    name:"express-cookie",
    cookie:{
        maxAge:1000 * 60 * 60 * 24 * 365 * 10
    }
}))



app.use(passport.initialize())
app.use(passport.session())


app.use(routes)



app.listen(PORT,()=>console.log(`Listening in on port ${PORT}`))