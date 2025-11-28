const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  lab:      { type: Number, required: true }   // ⭐ lab number
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
