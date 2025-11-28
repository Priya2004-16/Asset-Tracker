const mongoose = require("../database");   // connect using database.js

const collegeSchema = new mongoose.Schema({
    collegeName: { type: String, required: true },
    email: { type: String, required: true },
    branches: { type: [String], required: true },
    labs: { type: Number, required: true },

    // Match your frontend field name → systems (NOT systemsPerLab)
    systems: { type: Number, required: true },

    city: { type: String, required: true },
    pincode: { type: String, required: true },

    district: { type: String },     // optional unless you're using it
    state: { type: String },        // optional unless you're using it
    contact: { type: String },      // optional unless you're using it

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("College", collegeSchema);



