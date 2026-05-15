/**
 * Settings API Routes
 * 
 * GET  /api/settings  - Get current settings
 * PUT  /api/settings  - Update settings
 */

const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// ============ GET SETTINGS ============
router.get('/', async (req, res) => {
  try {
    // Get settings (create default if not exists)
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
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
    const {
      defaultReply,
      isAutoReplyEnabled,
      isAwayMode,
      awayMessage,
      greetingMessage,
      isGreetingEnabled
    } = req.body;

    // Find existing settings or create new
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    // Update fields
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
