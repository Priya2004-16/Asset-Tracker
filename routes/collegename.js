const express = require("express");
const router = express.Router();
const College = require("../models/college");

// GET / (home page)
router.get("/", async (req, res) => {
  try {
    // Fetch the first college document (adjust query if needed)
    const college = await College.findOne().sort({createdAt:-1});  

    // If no college found, fallback to default name
    const collegeName = college ? college.collegeName : "Default College";

    // Render home.ejs and pass the collegeName
    res.render("home", { collegeName });
  } catch (error) {
    console.error("Error fetching college info:", error);
    res.render("home", { collegeName: "Default College" });
  }
});

module.exports = router;
