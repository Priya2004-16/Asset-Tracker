const mongoose = require("mongoose");
module.exports = mongoose;
mongoose.connect("mongodb://127.0.0.1:27017/CollegeDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB connection error:", err));



