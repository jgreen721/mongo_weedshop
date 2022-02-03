const mongoose = require("mongoose");

const { Schema } = mongoose;

const smokerschema = new Schema({
  username: String,
  // weed_image:{
  //     type:String,
  //     maxlength:200
  // },
  password: String,
  email: String,
  balance: {
    type: Number,
    min: -20,
  },
  prefers_indica: {
    type: Boolean,
    default: true,
  },
  shopping_cart: {
    type: Array,
    default: [],
  },
});

smokerschema.pre("validate", (next) => {
  console.log("pre-validate fired");
  next();
});

module.exports = mongoose.model("Smoker", smokerschema);
