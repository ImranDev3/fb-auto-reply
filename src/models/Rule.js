/**
 * Rule Model (MongoDB Schema)
 * 
 * Each rule has:
 * - keyword: The word/phrase to match in incoming messages
 * - reply: The auto-reply message to send back
 * - isActive: Whether this rule is currently active
 * - createdAt: When the rule was created
 */

const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  // The keyword to match (stored in lowercase for easy matching)
  keyword: {
    type: String,
    required: [true, 'Keyword is required'],
    trim: true,
    lowercase: true
  },
  // The reply message to send when keyword matches
  reply: {
    type: String,
    required: [true, 'Reply message is required'],
    trim: true
  },
  // Which platform this rule applies to (both, messenger, whatsapp)
  platform: {
    type: String,
    enum: ['both', 'messenger', 'whatsapp'],
    default: 'both'
  },
  // Toggle rule on/off without deleting
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  // Automatically add createdAt and updatedAt fields
  timestamps: true
});

module.exports = mongoose.model('Rule', ruleSchema);
