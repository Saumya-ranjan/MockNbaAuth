const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  googleId: { type: String },
  githubId: { type: String },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String },
  password: { type: String },
  twitterUsername: { type: String },
});

// Model
const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;
