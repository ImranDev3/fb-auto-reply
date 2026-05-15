/**
 * Settings API Routes (User-specific)
 * 
 * GET  /api/settings  - Get user's settings
 * PUT  /api/settings  - Update user's settings
 */

const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');

router.use(protect);

// ============ GET SETTINGS ============
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await Settings.create({ userId: req.user._id });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ UPDATE SETTINGS ============
router.put('/', async (req, res) => {
  try {
    const { defaultReply, isAutoReplyEnabled, isAwayMode, awayMessage, greetingMessage, isGreetingEnabled } = req.body;

    let settings = await Settings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await Settings.create({ userId: req.user._id });
    }

    if (defaultReply !== undefined) settings.defaultReply = defaultReply;
    if (isAutoReplyEnabled !== undefined) settings.isAutoReplyEnabled = isAutoReplyEnabled;
    if (isAwayMode !== undefined) settings.isAwayMode = isAwayMode;
    if (awayMessage !== undefined) settings.awayMessage = awayMessage;
    if (greetingMessage !== undefined) settings.greetingMessage = greetingMessage;
    if (isGreetingEnabled !== undefined) settings.isGreetingEnabled = isGreetingEnabled;

    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error updating settings:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
