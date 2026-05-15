/**
 * Messenger Service
 * 
 * Handles:
 * 1. Matching incoming messages with keyword rules from DB
 * 2. Sending default reply when no keyword matches
 * 3. Away mode - always replies even without admin
 * 4. Sending replies via Facebook Graph API
 */

const axios = require('axios');
const Rule = require('../models/Rule');
const Settings = require('../models/Settings');

// Facebook Graph API URL for sending messages
const FB_API_URL = 'https://graph.facebook.com/v18.0/me/messages';

/**
 * Handle an incoming message:
 * - Check if auto-reply is enabled
 * - Search for matching keyword in DB
 * - If found, send the auto-reply
 * - If not found, send default reply (if away mode is ON)
 */
async function handleIncomingMessage(senderId, messageText) {
  try {
    // Get settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    // Check if auto-reply is enabled
    if (!settings.isAutoReplyEnabled) {
      console.log('⏸️ Auto-reply is disabled. Skipping.');
      return;
    }

    // Convert message to lowercase for case-insensitive matching
    const lowerMessage = messageText.toLowerCase().trim();

    // Search for matching rules (only messenger and both platform rules)
    const rules = await Rule.find({
      isActive: true,
      platform: { $in: ['messenger', 'both'] }
    });

    let matchedRule = null;

    for (const rule of rules) {
      if (lowerMessage.includes(rule.keyword)) {
        matchedRule = rule;
        break;
      }
    }

    if (matchedRule) {
      // Keyword matched! Send the auto-reply
      console.log(`✅ Keyword "${matchedRule.keyword}" matched. Sending reply...`);
      await sendMessage(senderId, matchedRule.reply);
    } else if (settings.isAwayMode) {
      // No keyword matched but away mode is ON - send default reply
      console.log(`🌙 No keyword matched. Away mode ON - sending default reply.`);
      await sendMessage(senderId, settings.defaultReply);
    } else {
      console.log(`ℹ️ No keyword matched and away mode is OFF. No reply sent.`);
    }
  } catch (error) {
    console.error('❌ Error handling message:', error.message);
  }
}

/**
 * Send a message to a user via Facebook Graph API
 */
async function sendMessage(recipientId, messageText) {
  try {
    const response = await axios.post(
      FB_API_URL,
      {
        recipient: { id: recipientId },
        message: { text: messageText }
      },
      {
        params: {
          access_token: process.env.FB_PAGE_ACCESS_TOKEN
        }
      }
    );

    console.log(`✅ Reply sent to ${recipientId}: "${messageText}"`);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending message:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { handleIncomingMessage, sendMessage };
