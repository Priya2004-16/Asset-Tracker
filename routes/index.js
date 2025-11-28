var express = require('express');
var router = express.Router();
const College = require("../models/college");   // IMPORTANT
const Admin = require("../models/admin");
const bcrypt = require("bcrypt");

/* GET main page */
router.get('/', function(req, res) {
  res.render("main");
});

/* GET college register page */
router.get('/register', function(req, res) {
  res.render("clgregister");
});

/* GET home page */
router.get("/home", async (req, res) => {
  try {
    const college = await College.findOne();   // fetch saved college

    res.render("home", {
      collegeName: college ? college.collegeName : "My College"
    });

  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* GET Admin Login Page */
router.get("/adminLogin", (req, res) => {
  res.render("adminlogin");
});

router.get("/admin/reset-password", (req, res) => {
  res.render("adminresetpwd");   
});

router.get("/admin", (req, res) => {
  res.render("admin");  
});

router.get("/createsubadmin", (req, res) => {
  res.render("createsubadmin");  
});

router.get("/createuser/page", (req, res) => {
  res.render("createuser");
});

router.get("/subadminLogin", (req, res) => {
  res.render("subadminlogin");
});

router.get("/subadmin", (req, res) => {
  res.render("subadmin");  
});

router.get("/userlogin", (req, res) => {
  res.render("userlogin");  
});

router.get("/assetinfo", (req, res) => {
  res.render("assetinfo");  
});

router.get("/staffinfo", (req, res) => {
  res.render("staffinfo");  
});
module.exports = router;
