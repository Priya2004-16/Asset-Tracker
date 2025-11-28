// routes/Transactions.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const College = require("../models/college");

// SHA256 generator
function sha256Hex(s) {
  return crypto.createHash("sha256").update(s, "utf8").digest("hex");
}

/**
 * ⭐ NEW: Fetch labs & branches dynamically from College DB
 */
router.get("/meta", async (req, res) => {
  try {
    const college = await College.findOne().lean();

    if (!college) {
      return res.json({ ok: false, error: "No college data found" });
    }

    // Convert labs: Number -> ["Lab 1", "Lab 2", ...]
    const labs = Array.from({ length: college.labs }, (_, i) => `Lab ${i + 1}`);

    const users = await User.find({}, "_id fullname email lab").lean();

    res.json({
      ok: true,
      labs,
      branches: college.branches,
      users
    });

  } catch (err) {
    console.error("META API Error:", err);
    res.status(500).json({ ok: false, error: "Server error fetching meta" });
  }
});

/**
 * ⭐ Save new Blockchain Transaction
 */
router.post("/", async (req, res) => {
  try {
    const { assetId, lab, dept, action, userId } = req.body;

    if (!assetId || !lab || !dept || !action || !userId) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    // Fetch logged-in user by ID from frontend LocalStorage
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(401).json({ ok: false, error: "Invalid user" });
    }

    const requiredLab = `Lab ${user.lab}`;
    if (lab !== requiredLab) {
      return res.status(403).json({
        ok: false,
        error: `You can add assets ONLY to ${requiredLab}`
      });
    }

    // Fetch latest transaction for asset for validating status
    const lastAssetTx = await Transaction.findOne({ assetId }).sort({ timestamp: -1 }).lean();

    if (action === "Added" && lastAssetTx) {
      return res.status(409).json({
        ok: false,
        error: "Asset already exists. Use Issue/Repair/Return instead."
      });
    }

    if (action === "Issued") {
      if (!lastAssetTx) {
        return res.status(400).json({
          ok: false,
          error: "Cannot issue. Asset not added yet!"
        });
      }
      if (lastAssetTx.action === "Issued") {
        return res.status(400).json({
          ok: false,
          error: "Asset already issued!"
        });
      }
    }

    if (action === "Returned" && (!lastAssetTx || lastAssetTx.action !== "Issued")) {
      return res.status(400).json({ ok: false, error: "Cannot return. Asset not issued!" });
    }

    if (action === "Repaired" && (!lastAssetTx || lastAssetTx.action === "Decommissioned")) {
      return res.status(400).json({ ok: false, error: "Cannot repair. Asset inactive!" });
    }

    if (action === "Decommissioned" && !lastAssetTx) {
      return res.status(400).json({
        ok: false,
        error: "Cannot decommission before adding asset!"
      });
    }

    // Blockchain hashing
    const lastTx = await Transaction.findOne({}).sort({ timestamp: -1 }).lean();
    const previousHash = lastTx ? lastTx.currentHash : "GENESIS";
    const currentHash = sha256Hex(
      `${assetId}|${action}|${user._id}|${new Date().toISOString()}|${lab}|${dept}|${previousHash}`
    );

    const tx = new Transaction({
      assetId,
      lab,
      dept,
      action,
      user: user._id,
      timestamp: new Date(),
      previousHash,
      currentHash
    });

    await tx.save();

    res.json({ ok: true, transaction: tx });

  } catch (err) {
    console.error("POST /api/transactions error:", err);
    res.status(500).json({ ok: false, error: "Server error saving transaction" });
  }
});

/**
 * ⭐ GET transactions (supports filtering by assigned lab)
 */
router.get("/", async (req, res) => {
  try {
    const { lab } = req.query;
    let filter = {};

    if (lab) {
      filter.lab = lab; // only logged-in user’s lab
    }

    const transactions = await Transaction.find(filter)
      .populate("user", "fullname email")
      .sort({ timestamp: -1 });

    res.json({ ok: true, transactions });

  } catch (err) {
    console.error("GET /api/transactions error:", err);
    res.status(500).json({ ok: false, error: "Server error loading transactions" });
  }
});


module.exports = router;
