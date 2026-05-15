/**
 * Rules API Routes
 * 
 * CRUD endpoints for managing auto-reply rules:
 * GET    /api/rules       - Get all rules
 * POST   /api/rules       - Create a new rule
 * PUT    /api/rules/:id   - Update a rule
 * DELETE /api/rules/:id   - Delete a rule
 */

const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');

// ============ GET ALL RULES ============
router.get('/', async (req, res) => {
  try {
    // Fetch all rules, newest first
    const rules = await Rule.find().sort({ createdAt: -1 });
    res.json({ success: true, data: rules });
  } catch (error) {
    console.error('Error fetching rules:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ CREATE A NEW RULE ============
router.post('/', async (req, res) => {
  try {
    const { keyword, reply } = req.body;

    // Validate input
    if (!keyword || !reply) {
      return res.status(400).json({
        success: false,
        message: 'Both keyword and reply are required'
      });
    }

    // Create and save the rule
    const rule = await Rule.create({ keyword, reply });
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    console.error('Error creating rule:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ UPDATE A RULE ============
router.put('/:id', async (req, res) => {
  try {
    const { keyword, reply, isActive } = req.body;

    const rule = await Rule.findByIdAndUpdate(
      req.params.id,
      { keyword, reply, isActive },
      { new: true, runValidators: true }
    );

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    res.json({ success: true, data: rule });
  } catch (error) {
    console.error('Error updating rule:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ DELETE A RULE ============
router.delete('/:id', async (req, res) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.id);

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
