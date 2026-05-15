/**
 * Messenger Service
 * 
 * This file handles:
 * 1. Matching incoming messages with keyword rules from DB
 * 2. Sending replies via Facebook Graph API
 */

const axios = require('axios');
const Rule = require('../models/Rule');

// Facebook Graph API URL for sending messages
const FB_API_URL = 'https://graph.facebook.com/v18.0/me/messages';

/**
 * Handle an incoming message:
 * - Search for matching keyword in DB
 * - If found, send the auto-reply
 * - If not found, optionally send a default reply
 */
async function handleIncomingMessage(senderId, messageText) {
  try {
    // Convert message to lowercase for case-insensitive matching
    const lowerMessage = messageText.toLowerCase().trim();

    // Search for a matching rule in the database
    // Check if any keyword is contained in the message
    const rules = await Rule.find({ isActive: true });

    let matchedRule = null;

    for (const rule of rules) {
      // Check if the keyword exists in the incoming message
      if (lowerMessage.includes(rule.keyword)) {
        matchedRule = rule;
        break; // Use the first match
      }
    }

    if (matchedRule) {
      // Keyword matched! Send the auto-reply
      console.log(`✅ Keyword "${matchedRule.keyword}" matched. Sending reply...`);
      await sendMessage(senderId, matchedRule.reply);
    } else {
      // No keyword matched - you can send a default reply or do nothing
      console.log(`ℹ️ No keyword matched for: "${messageText}"`);
      // Uncomment below to send a default reply:
      // await sendMessage(senderId, "Thanks for your message! We'll get back to you soon.");
    }
  } catch (error) {
    console.error('❌ Error handling message:', error.message);
  }
}

/**
 * Send a message to a user via Facebook Graph API
 * 
 * @param {string} recipientId - The Facebook user ID to send to
 * @param {string} messageText - The text message to send
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
