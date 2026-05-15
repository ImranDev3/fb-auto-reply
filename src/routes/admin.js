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
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// All admin routes require auth + admin role
router.use(protect);
router.use(adminOnly);

// ============ CREATE USER (Admin creates on behalf) ============
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, plan, maxRules } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, password required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });

    const limits = { free: 5, starter: 25, pro: 100, enterprise: 99999 };
    const user = await User.create({
      name, email, password,
      subscription: {
        plan: plan || 'free',
        maxRules: maxRules || limits[plan] || 5,
        startDate: new Date(),
        isActive: true
      }
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

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
    const { plan, maxRules, isActive, startDate, endDate, couponUsed, paymentMethod, amount, transactionId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (plan) user.subscription.plan = plan;
    if (maxRules) user.subscription.maxRules = maxRules;
    if (isActive !== undefined) user.subscription.isActive = isActive;
    if (startDate) user.subscription.startDate = new Date(startDate);
    if (endDate) user.subscription.endDate = new Date(endDate);
    if (couponUsed !== undefined) user.subscription.couponUsed = couponUsed;
    if (paymentMethod !== undefined) user.subscription.paymentMethod = paymentMethod;
    if (amount !== undefined) user.subscription.amount = amount;
    if (transactionId !== undefined) user.subscription.transactionId = transactionId;

    // Auto-set maxRules based on plan if not provided
    if (plan && !maxRules) {
      const limits = { free: 5, starter: 25, pro: 100, enterprise: 99999 };
      user.subscription.maxRules = limits[plan] || 5;
    }

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

// ============ COUPONS ============
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const { code, discount, plan, maxUses, expiresAt } = req.body;
    if (!code || !discount) return res.status(400).json({ success: false, message: 'Code and discount required' });
    const coupon = await Coupon.create({ code, discount, plan: plan || 'all', maxUses: maxUses || 100, expiresAt: expiresAt || null });
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
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
