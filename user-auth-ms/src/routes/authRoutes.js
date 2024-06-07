const express = require('express');
const { withAuth } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');
const router = express.Router();

// Get current user
router.get('/me', withAuth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.auth.emailAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    const user = new User({ email, name, googleId });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login user
router.post('/login', withAuth, async (req, res) => {
  try {
    const { email } = req.auth;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name: req.auth.fullName, googleId: req.auth.id });
      await user.save();
    }
    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
