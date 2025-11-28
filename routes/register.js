const express = require("express");
const router = express.Router();
const College = require("../models/college");
const sendMail = require("../email");

// SAVE COLLEGE DATA
router.post("/", async (req, res) => {
  try {
    console.log("Received:", req.body);

    await College.create(req.body);

    // Send confirmation email
    await sendMail(
      req.body.email,
      "College Registration Successful",
      `Hello ${req.body.collegeName}, your registration was successful!`
    );

    res.redirect("/home");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send("Error saving data");
  }
});

module.exports = router;
