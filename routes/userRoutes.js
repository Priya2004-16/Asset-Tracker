const express = require("express");
const router = express.Router();
const College = require("../models/college");

const User = require("../models/User");
const SubAdmin = require("../models/SubAdmin");

// Generate random password
function generatePassword(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

// Create user
router.post("/", async (req, res) => {
  try {
    const { fullname, email, lab } = req.body;

    if (!fullname || !email || !lab) {
      return res.status(400).json({ message: "Fullname, email and lab are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate lab
    const labNumber = parseInt(lab, 10);
    if (isNaN(labNumber) || labNumber <= 0) {
      return res.status(400).json({ message: "Invalid lab number" });
    }

    // Validate email unique
    const existsInUsers = await User.findOne({ email });
    const existsInSubs = await SubAdmin.findOne({ username: email });

    if (existsInUsers || existsInSubs) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Validate lab does not exceed registered college labs
    const college = await College.findOne(); // assuming one college setup
    if (college && labNumber > college.labs) {
      return res.status(400).json({
        message: `Lab number cannot be greater than ${college.labs}`
      });
    }

    // Generate unique password
    let password;
    do {
      password = generatePassword();
    } while (await User.findOne({ password }));

    const newUser = await User.create({
      fullname,
      email,
      password,
      lab: labNumber
    });

    res.json({
  message: "User created!",
  user: {
    _id: newUser._id,
    fullname: newUser.fullname,
    email: newUser.email,
    password: newUser.password,
    lab: newUser.lab // ⭐ Now included in response
  }
});


  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const { fullname, email, lab } = req.body;

    if (!fullname || !email || !lab) {
      return res.status(400).json({ message: "Fullname, email and lab are required" });
    }

    const existsInUsers = await User.findOne({ email });
    const existsInSubs = await SubAdmin.findOne({ username: email });

    const currentUser = await User.findById(req.params.id);

    if ((existsInUsers && existsInUsers._id.toString() !== currentUser._id.toString()) || existsInSubs) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // Validate lab number
    const labNumber = parseInt(lab, 10);
    if (isNaN(labNumber) || labNumber <= 0) {
      return res.status(400).json({ message: "Invalid lab number" });
    }

    const college = await College.findOne();
    if (college && labNumber > college.labs) {
      return res.status(400).json({
        message: `Lab number cannot be greater than ${college.labs}`
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { fullname, email, lab: labNumber },
      { new: true }
    );

    res.json({ message: "User updated!", user: updated });

  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted!" });
});

module.exports = router;
