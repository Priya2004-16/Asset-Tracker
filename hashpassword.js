const mongoose = require("mongoose");
const Admin = require("./models/admin");
const bcrypt = require("bcrypt");

mongoose.connect("mongodb://127.0.0.1:27017/CollegeDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    hashPassword();
  })
  .catch(err => console.error("MongoDB connection error:", err));

async function hashPassword() {
  const admin = await Admin.findOne({ email: "priyagowda8618@gmail.com" });
  if (!admin) return console.log("Admin not found");

  admin.password = await bcrypt.hash("Admin@123", 10);
  await admin.save();
  console.log("Password hashed successfully");
  mongoose.disconnect();
}
