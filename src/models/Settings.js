/**
 * Settings Model (MongoDB Schema)
 * 
 * Stores global settings for the auto-reply system:
 * - defaultReply: Message to send when no keyword matches
 * - isAutoReplyEnabled: Master ON/OFF switch for auto-reply
 * - isAwayMode: When ON, sends away message even if no keyword matches
 * - awayMessage: Custom away message
 */

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Which user owns these settings
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Default reply when no keyword matches
  defaultReply: {
    type: String,
    default: 'Thanks for your message! We will get back to you soon. 🙏'
  },
  // Master switch - ON means auto reply is active 24/7
  isAutoReplyEnabled: {
    type: Boolean,
    default: true
  },
  // Away mode - sends away message when admin is not available
  isAwayMode: {
    type: Boolean,
    default: true
  },
  // Custom away message
  awayMessage: {
    type: String,
    default: 'Hi! We are currently away. Your message is important to us. We will reply as soon as possible. Thank you! 🙏'
  },
  // Greeting message for first-time users
  greetingMessage: {
    type: String,
    default: 'Welcome! 👋 How can we help you today?'
  },
  // Enable greeting message
  isGreetingEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
