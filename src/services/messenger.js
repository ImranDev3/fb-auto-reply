/**
 * Messenger Service (Multi-tenant)
 * 
 * Handles:
 * 1. Finding which user owns the page that received the message
 * 2. Matching incoming messages with that user's keyword rules
 * 3. Sending default reply when no keyword matches (away mode)
 * 4. Sending replies via Facebook Graph API using user's token
 */

const axios = require('axios');
const Rule = require('../models/Rule');
const Settings = require('../models/Settings');
const User = require('../models/User');

const FB_API_URL = 'https://graph.facebook.com/v18.0/me/messages';

/**
 * Handle an incoming message
 */
async function handleIncomingMessage(senderId, messageText, pageId) {
  try {
    // Find the user who owns this page
    let user = null;
    if (pageId) {
      user = await User.findOne({ 'pageDetails.pageId': pageId });
    }

    // If no user found by pageId, use the global token (backward compatible)
    const accessToken = user?.pageDetails?.pageAccessToken || process.env.FB_PAGE_ACCESS_TOKEN;
    const userId = user?._id;

    // Get settings (user-specific or global)
    let settings;
    if (userId) {
      settings = await Settings.findOne({ userId });
    }
    if (!settings) {
      settings = await Settings.findOne({});
    }
    if (!settings) {
      settings = { isAutoReplyEnabled: true, isAwayMode: true, defaultReply: 'Thanks for your message!' };
    }

    // Check if auto-reply is enabled
    if (!settings.isAutoReplyEnabled) {
      console.log('⏸️ Auto-reply is disabled.');
      return;
    }

    const lowerMessage = messageText.toLowerCase().trim();

    // Search for matching rules
    const query = { isActive: true, platform: { $in: ['messenger', 'both'] } };
    if (userId) query.userId = userId;

    const rules = await Rule.find(query);

    let matchedRule = null;
    for (const rule of rules) {
      if (lowerMessage.includes(rule.keyword)) {
        matchedRule = rule;
        break;
      }
    }

    if (matchedRule) {
      console.log(`✅ Keyword "${matchedRule.keyword}" matched. Sending reply...`);
      await sendMessage(senderId, matchedRule.reply, accessToken);
    } else if (settings.isAwayMode) {
      console.log(`🌙 No keyword matched. Away mode ON - sending default reply.`);
      await sendMessage(senderId, settings.defaultReply, accessToken);
    } else {
      console.log(`ℹ️ No keyword matched and away mode is OFF.`);
    }
  } catch (error) {
    console.error('❌ Error handling message:', error.message);
  }
}

/**
 * Send a message via Facebook Graph API
 */
async function sendMessage(recipientId, messageText, accessToken) {
  try {
    const token = accessToken || process.env.FB_PAGE_ACCESS_TOKEN;
    const response = await axios.post(
      FB_API_URL,
      {
        recipient: { id: recipientId },
        message: { text: messageText }
      },
      { params: { access_token: token } }
    );

    console.log(`✅ Reply sent to ${recipientId}: "${messageText}"`);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending message:', error.response?.data || error.message);
  }
}

module.exports = { handleIncomingMessage, sendMessage };
