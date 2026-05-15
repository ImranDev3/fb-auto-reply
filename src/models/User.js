/**
 * User Model (MongoDB Schema)
 * 
 * Multi-tenant SaaS user:
 * - Each user has their own account
 * - Each user connects their own Facebook/WhatsApp page
 * - Each user manages their own auto-reply rules
 * - Subscription plan controls features
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // User credentials
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },

  // Profile
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },

  // Facebook/WhatsApp Page Details
  pageDetails: {
    pageName: { type: String, default: '' },
    pageId: { type: String, default: '' },
    pageAccessToken: { type: String, default: '' },
    whatsappPhoneNumberId: { type: String, default: '' },
    whatsappAccessToken: { type: String, default: '' }
  },

  // Subscription Plan
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'enterprise'],
      default: 'free'
    },
    // Max rules allowed per plan
    maxRules: {
      type: Number,
      default: 5 // free = 5, starter = 25, pro = 100, enterprise = unlimited
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  // Admin role
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
