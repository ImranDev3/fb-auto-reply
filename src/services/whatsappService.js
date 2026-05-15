/**
 * WhatsApp Service
 * 
 * Handles:
 * 1. Matching incoming WhatsApp messages with keyword rules from DB
 * 2. Sending replies via WhatsApp Cloud API
 */

const axios = require('axios');
const Rule = require('../models/Rule');

// WhatsApp Cloud API URL
const WA_API_URL = 'https://graph.facebook.com/v18.0';

/**
 * Handle an incoming WhatsApp message:
 * - Search for matching keyword in DB
 * - If found, send the auto-reply via WhatsApp
 */
async function handleWhatsAppMessage(phoneNumberId, senderPhone, messageText) {
  try {
    // Convert message to lowercase for case-insensitive matching
    const lowerMessage = messageText.toLowerCase().trim();

    // Search for matching rules in database
    const rules = await Rule.find({ isActive: true });

    let matchedRule = null;

    for (const rule of rules) {
      if (lowerMessage.includes(rule.keyword)) {
        matchedRule = rule;
        break;
      }
    }

    if (matchedRule) {
      console.log(`✅ WhatsApp: Keyword "${matchedRule.keyword}" matched. Sending reply...`);
      await sendWhatsAppMessage(phoneNumberId, senderPhone, matchedRule.reply);
    } else {
      console.log(`ℹ️ WhatsApp: No keyword matched for: "${messageText}"`);
      // Uncomment below for default reply:
      // await sendWhatsAppMessage(phoneNumberId, senderPhone, "Thanks for your message! We'll get back to you soon.");
    }
  } catch (error) {
    console.error('❌ Error handling WhatsApp message:', error.message);
  }
}

/**
 * Send a WhatsApp message via Cloud API
 * 
 * @param {string} phoneNumberId - Your WhatsApp Business phone number ID
 * @param {string} to - Recipient's phone number (with country code)
 * @param {string} messageText - The text message to send
 */
async function sendWhatsAppMessage(phoneNumberId, to, messageText) {
  try {
    const response = await axios.post(
      `${WA_API_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: messageText }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ WhatsApp reply sent to ${to}: "${messageText}"`);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { handleWhatsAppMessage, sendWhatsAppMessage };
