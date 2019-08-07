let mongoose = require("mongoose");
let userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    type: {
      type: String,
      default: "user"
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

let User = (module.exports = mongoose.model("User", userSchema));
