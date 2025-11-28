const express = require("express");
const router = express.Router();
const SubAdmin = require("../models/subadmin");
const User = require("../models/User");

// Generate random password
function generatePassword(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

// Check email exists in SubAdmins
router.get("/exists/:email", async (req, res) => {
  try {
    // normalize incoming email
    const email = (req.params.email || "").trim().toLowerCase();

    // search both collections
    const user = await User.findOne({ email });
    const subadmin = await SubAdmin.findOne({ email });

    // boolean existence, and extra info so frontend can show a better message
    const exists = !!(user || subadmin);

    res.json({
      exists,
      inUser: !!user,
      inSubAdmin: !!subadmin
    });
  } catch (err) {
    console.error("exists check error:", err);
    res.status(500).json({ exists: false, error: "Server error" });
  }
});


// Create new SubAdmin
router.post("/", async (req, res) => {
    console.log("🔥 POST /api/subadmin HIT", req.body);
  try {
    const { fullname, email } = req.body;

    const emailExists = await SubAdmin.findOne({ username: email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let password = generatePassword();

    const newSubAdmin = await SubAdmin.create({
      fullname,
      username: email,
      password
    });

    res.json(newSubAdmin);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all SubAdmins
router.get("/", async (req, res) => {
  try {
    const list = await SubAdmin.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update SubAdmin
router.put("/:id", async (req, res) => {
  try {
    const { fullname, email } = req.body;

    const updated = await SubAdmin.findByIdAndUpdate(
      req.params.id,
      { fullname, username: email },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete SubAdmin
router.delete("/:id", async (req, res) => {
  try {
    await SubAdmin.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// LOGIN SubAdmin
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username exists
    const subadmin = await SubAdmin.findOne({ username });
    if (!subadmin) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Compare password
    if (subadmin.password !== password) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Success
    return res.status(200).json({
      message: "Login successful",
      fullname: subadmin.fullname,
      username: subadmin.username
    });

  } catch (err) {
    console.error("🔥 LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
