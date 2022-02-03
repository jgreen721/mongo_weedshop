const mongoose = require("mongoose");

const { Schema } = mongoose;

const weedschema = new Schema(
  {
    weed_name: String,
    weed_id: {
      type: Number,
    },
    weed_image: {
      type: String,
      maxlength: 350,
    },
    price: Number,
    quantity: Number,
    is_indica: {
      type: Boolean,
      default: true,
    },
    on_sale: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

weedschema.pre("validate", (next) => {
  console.log("pre-validate fired");
  next();
});

module.exports = mongoose.model("Weed", weedschema);
