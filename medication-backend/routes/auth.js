const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const redisClient = require('../redis');
const validateInput = require('../middleware/validateInput');
const { authLimiter } = require('../middleware/rateLimiter');
const transporter = require('../config/email');
const crypto = require('crypto');
const router = express.Router();

// Register
router.post('/register',
  authLimiter,
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['user', 'doctor', 'admin'])
  ],
  validateInput,
  async (req, res, next) => {
    try {
      const { email, password, role } = req.body;
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: 'User already exists' });
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ email, password: hashedPassword, role: role || 'user' });
      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// Login
router.post('/login',
  authLimiter,
  [
    body('email').isEmail(),
    body('password').exists()
  ],
  validateInput,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      await redisClient.set(`token:${user._id}`, token, { EX: 3600 });
      res.json({
        token,
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      });
    } catch (err) {
      console.log("/login auth error",err)
      next(err);

    }
  }
);

// Logout
router.post('/logout', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await redisClient.del(`token:${decoded.userId}`);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// Password Reset Request
router.post('/password-reset-request', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    const token = crypto.randomBytes(32).toString('hex');
    await redisClient.set(`reset:${token}`, user._id.toString(), { EX: 3600 });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      text: `Reset your password: ${resetUrl}`,
    });
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
});

// Password Reset
router.post('/password-reset', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const userId = await redisClient.get(`reset:${token}`);
    if (!userId) return res.status(400).json({ message: 'Invalid or expired token' });
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });
    await redisClient.del(`reset:${token}`);
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh-token', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Optionally check if token is blacklisted in Redis
    const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await redisClient.set(`token:${decoded.userId}`, newToken, { EX: 3600 });
    res.json({ token: newToken });
  } catch (err) {
    next(err);
  }
});

module.exports = router; 