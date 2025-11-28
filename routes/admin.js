var express = require('express');
var router = express.Router();
const College = require("../models/college");   // IMPORTANT
const Admin = require("../models/admin");
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin) return res.json({ success: false, message: "Invalid email" });

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.json({ success: false, message: "Invalid password" });

  res.json({ success: true });
});


router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin) return res.json({ success: false, message: "Email not found" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  
  // Save OTP temporarily
  admin.resetOtp = otp;
  admin.otpExpiry = Date.now() + 5 * 60 * 1000;
  await admin.save();

  // send OTP to admin email using nodemailer
  await sendOtpEmail(email, otp);

  res.json({ success: true, message: "OTP sent to email" });
});


router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const admin = await Admin.findOne({ email });

  if (!admin || admin.resetOtp != otp)
    return res.json({ success: false, message: "Invalid OTP" });

  if (Date.now() > admin.otpExpiry) {
  return res.json({ success: false, message: "OTP expired" });
}

  admin.password = await bcrypt.hash(newPassword, 10);
  admin.resetOtp = null;
  await admin.save();

  res.json({ success: true, message: "Password reset successfully" });
});

module.exports = router;
