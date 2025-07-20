const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get user profile
router.get('/', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const profile = user.profile || {};
    res.json({ ...profile, timezone: user.timezone || 'UTC' });
  } catch (err) {
    next(err);
  }
});

// Update user profile
router.put('/', auth, async (req, res, next) => {
  try {
    const { timezone, ...profileData } = req.body;
    const update = { profile: profileData };
    if (timezone) update.timezone = timezone;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      update,
      { new: true }
    );
    res.json({ ...user.profile, timezone: user.timezone });
  } catch (err) {
    next(err);
  }
});

// Add or update doctor contact
router.put('/doctor', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.doctors = req.body.doctors;
    await user.save();
    res.json(user.doctors);
  } catch (err) {
    next(err);
  }
});

module.exports = router; 