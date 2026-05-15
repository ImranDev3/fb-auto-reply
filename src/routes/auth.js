/**
 * Authentication Routes
 * 
 * POST /api/auth/register  - Create new account
 * POST /api/auth/login     - Login to account
 * GET  /api/auth/me        - Get current user profile
 * PUT  /api/auth/profile   - Update profile
 * PUT  /api/auth/password  - Change password
 * PUT  /api/auth/page      - Update page details
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

// ============ REGISTER ============
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ LOGIN ============
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        pageDetails: user.pageDetails,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ GET PROFILE ============
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, data: req.user });
});

// ============ UPDATE PROFILE ============
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ CHANGE PASSWORD ============
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required' });
    }

    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ UPDATE PAGE DETAILS ============
router.put('/page', protect, async (req, res) => {
  try {
    const { pageName, pageId, pageAccessToken, whatsappPhoneNumberId, whatsappAccessToken } = req.body;

    const user = await User.findById(req.user._id);

    if (pageName !== undefined) user.pageDetails.pageName = pageName;
    if (pageId !== undefined) user.pageDetails.pageId = pageId;
    if (pageAccessToken !== undefined) user.pageDetails.pageAccessToken = pageAccessToken;
    if (whatsappPhoneNumberId !== undefined) user.pageDetails.whatsappPhoneNumberId = whatsappPhoneNumberId;
    if (whatsappAccessToken !== undefined) user.pageDetails.whatsappAccessToken = whatsappAccessToken;

    await user.save();

    res.json({ success: true, data: user.pageDetails });
  } catch (error) {
    console.error('Page update error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
