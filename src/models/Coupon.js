/**
 * Coupon Model
 * Admin creates coupons, users can apply during subscription
 */

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discount: {
    type: Number, // percentage (e.g. 10 = 10% off)
    required: true
  },
  plan: {
    type: String,
    enum: ['all', 'starter', 'pro', 'enterprise'],
    default: 'all'
  },
  maxUses: {
    type: Number,
    default: 100
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
