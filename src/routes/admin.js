/**
 * Admin Routes
 * 
 * Only accessible by admin users
 * Manage all users, subscriptions, view stats
 * 
 * GET    /api/admin/users          - Get all users
 * GET    /api/admin/users/:id      - Get single user details
 * PUT    /api/admin/users/:id      - Update user (subscription, status)
 * DELETE /api/admin/users/:id      - Delete user
 * GET    /api/admin/stats          - Get platform stats
 * PUT    /api/admin/users/:id/subscription - Update subscription
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Rule = require('../models/Rule');
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// All admin routes require auth + admin role
router.use(protect);
router.use(adminOnly);

// ============ GET ALL USERS ============
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Get rule count for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const ruleCount = await Rule.countDocuments({ userId: user._id });
      return {
        ...user.toObject(),
        ruleCount
      };
    }));

    res.json({ success: true, data: usersWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ GET SINGLE USER ============
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const rules = await Rule.find({ userId: user._id });
    const settings = await Settings.findOne({ userId: user._id });

    res.json({ success: true, data: { user, rules, settings } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ UPDATE USER ============
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, isActive, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (isActive !== undefined) user.isActive = isActive;
    if (role !== undefined) user.role = role;

    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ UPDATE SUBSCRIPTION ============
router.put('/users/:id/subscription', async (req, res) => {
  try {
    const { plan, maxRules, isActive, endDate } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (plan) user.subscription.plan = plan;
    if (maxRules) user.subscription.maxRules = maxRules;
    if (isActive !== undefined) user.subscription.isActive = isActive;
    if (endDate) user.subscription.endDate = endDate;
    user.subscription.startDate = new Date();

    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ UPDATE USER PAGE DETAILS (Admin) ============
router.put('/users/:id/page', async (req, res) => {
  try {
    const { pageName, pageId, pageAccessToken, whatsappPhoneNumberId, whatsappAccessToken } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (pageName !== undefined) user.pageDetails.pageName = pageName;
    if (pageId !== undefined) user.pageDetails.pageId = pageId;
    if (pageAccessToken !== undefined) user.pageDetails.pageAccessToken = pageAccessToken;
    if (whatsappPhoneNumberId !== undefined) user.pageDetails.whatsappPhoneNumberId = whatsappPhoneNumberId;
    if (whatsappAccessToken !== undefined) user.pageDetails.whatsappAccessToken = whatsappAccessToken;

    await user.save();
    res.json({ success: true, data: user.pageDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ DELETE USER ============
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Delete user's rules and settings too
    await Rule.deleteMany({ userId: user._id });
    await Settings.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'User and all data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ PLATFORM STATS ============
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalRules = await Rule.countDocuments();
    const freeUsers = await User.countDocuments({ 'subscription.plan': 'free' });
    const proUsers = await User.countDocuments({ 'subscription.plan': 'pro' });
    const enterpriseUsers = await User.countDocuments({ 'subscription.plan': 'enterprise' });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalRules,
        freeUsers,
        proUsers,
        enterpriseUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
