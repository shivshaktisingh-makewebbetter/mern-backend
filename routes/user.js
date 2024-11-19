// routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(201).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST check if username exists
router.post("/check-username", async (req, res) => {
  const { username } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username });

    if (user) {
      // Username already exists
      return res.status(409).json({ message: "Username already exists" });
    }

    // Username does not exist
    res.status(201).json({ message: "Username is available" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
