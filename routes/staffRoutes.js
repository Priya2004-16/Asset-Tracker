// routes/staffRoutes.js
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const SubAdmin = require("../models/subadmin");


// 1️⃣ GET ALL STAFF DETAILS
router.get("/staffs", async (req, res) => {
  try {
    const users = await User.find({}, "-__v").sort({ fullname: 1 });
    res.json(users);
  } catch (err) {
    console.error("Error fetching staffs:", err.message);
    res.status(500).json({ message: "Server error fetching staffs" });
  }
});


// 2️⃣ GET A SINGLE STAFF
router.get("/staff/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, "-__v");
    if (!user) return res.status(404).json({ message: "Staff not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching staff details:", err.message);
    res.status(500).json({ message: "Error fetching staff details" });
  }
});


// 3️⃣ EDIT STAFF DETAILS (FULLNAME, EMAIL, LAB)
router.put("/staff/:userId", async (req, res) => {
  const { fullname, email } = req.body;
  const { userId } = req.params;

  if (!fullname || !email)
    return res.status(400).json({ message: "Fullname and email are required!" });

  try {
    // Check if email exists in other STAFF user
    const staffExists = await User.findOne({
      email,
      _id: { $ne: userId } // ignore current staff
    });

    if (staffExists) {
      return res.status(409).json({ message: "⚠ Email already exists in Staff users!" });
    }

    // Check if email exists in SubAdmins
    const subadminExists = await SubAdmin.findOne({ username: email });
    if (subadminExists) {
      return res.status(409).json({ message: "⚠ Email already exists in SubAdmins!" });
    }

    // Update staff details
    await User.findByIdAndUpdate(userId, { fullname, email });
    res.json({ message: "Staff updated successfully!" });

  } catch (err) {
    console.error("Update failed:", err.message);
    res.status(500).json({ message: "Server error updating staff" });
  }
});




// 4️⃣ RESET STAFF PASSWORD ONLY
router.put("/staff/:userId/password", async (req, res) => {
  const { password } = req.body;
  const { userId } = req.params;

  if (!password)
    return res.status(400).json({ message: "Password is required!" });

  try {
    await User.findByIdAndUpdate(userId, { password }, { runValidators: false });
    res.json({ message: "Password reset successful!" });
  } catch (err) {
    console.error("Password reset failed:", err.message);
    res.status(500).json({ message: "Server error resetting password" });
  }
});


// 5️⃣ DELETE STAFF
router.delete("/staff/:userId", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: "Staff deleted successfully!" });
  } catch (err) {
    console.error("Delete failed:", err.message);
    res.status(500).json({ message: "Server error deleting staff" });
  }
});


// 6️⃣ GET ASSET IDs ASSIGNED TO STAFF
router.get("/assets/:userId", async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.params.userId }).select("assetId");
    const uniqueAssetIds = [...new Set(transactions.map(t => t.assetId))];
    res.json(uniqueAssetIds);
  } catch (err) {
    console.error("Error fetching user's assets:", err.message);
    res.status(500).json({ message: "Server error fetching assets" });
  }
});


// 7️⃣ FULL ASSET HISTORY (CHRONOLOGICAL)
router.get("/asset/:assetId", async (req, res) => {
  try {
    const history = await Transaction.find({ assetId: req.params.assetId })
      .populate("user", "fullname email")
      .sort({ timestamp: 1 });

    res.json(history);
  } catch (err) {
    console.error("Error fetching asset history:", err.message);
    res.status(500).json({ message: "Server error fetching asset history" });
  }
});


module.exports = router;
