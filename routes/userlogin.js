const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // ⭐ We do NOT use session now — frontend will store login info
    const userData = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      lab: user.lab // ⭐ Required for auto Lab fill
    };

    return res.status(200).json({
      message: "Login successful",
      user: userData
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
