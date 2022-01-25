const mongoose = require('mongoose');

const {Schema} = mongoose;


const weedschema = new Schema({
    weedname:String,
    weed_image:{
        type:String,
        maxlength:200
    },
    price:Number,
    quantity:Number,
    is_indica:{
        type:Boolean,
        default:true
    },
    on_sale:{
        type:Boolean,
        default:false,
    }
})


weedschema.pre("validate",(next)=>{
    console.log("pre-validate fired")
    next()
})

module.exports = mongoose.model("Weed",weedschema)