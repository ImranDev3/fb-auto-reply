/**
 * Rules API Routes (User-specific)
 * 
 * All routes are protected - user must be logged in
 * Each user only sees/manages their own rules
 * 
 * GET    /api/rules       - Get user's rules
 * POST   /api/rules       - Create a new rule
 * PUT    /api/rules/:id   - Update a rule
 * DELETE /api/rules/:id   - Delete a rule
 */

const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// ============ GET ALL RULES (user's own) ============
router.get('/', async (req, res) => {
  try {
    const rules = await Rule.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: rules });
  } catch (error) {
    console.error('Error fetching rules:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ CREATE A NEW RULE ============
router.post('/', async (req, res) => {
  try {
    const { keyword, reply, platform } = req.body;

    if (!keyword || !reply) {
      return res.status(400).json({ success: false, message: 'Both keyword and reply are required' });
    }

    // Check subscription limit
    const ruleCount = await Rule.countDocuments({ userId: req.user._id });
    const maxRules = req.user.subscription.maxRules;

    if (ruleCount >= maxRules) {
      return res.status(403).json({
        success: false,
        message: `Rule limit reached (${maxRules}). Upgrade your plan for more rules.`
      });
    }

    const rule = await Rule.create({
      userId: req.user._id,
      keyword,
      reply,
      platform: platform || 'both'
    });

    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    console.error('Error creating rule:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ UPDATE A RULE ============
router.put('/:id', async (req, res) => {
  try {
    const { keyword, reply, isActive, platform } = req.body;

    // Only allow updating own rules
    const rule = await Rule.findOne({ _id: req.params.id, userId: req.user._id });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    if (keyword !== undefined) rule.keyword = keyword;
    if (reply !== undefined) rule.reply = reply;
    if (isActive !== undefined) rule.isActive = isActive;
    if (platform !== undefined) rule.platform = platform;

    await rule.save();
    res.json({ success: true, data: rule });
  } catch (error) {
    console.error('Error updating rule:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ DELETE A RULE ============
router.delete('/:id', async (req, res) => {
  try {
    const rule = await Rule.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    res.json({ success: true, message: 'Rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting rule:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
