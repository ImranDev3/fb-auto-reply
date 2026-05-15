/**
 * WhatsApp Service
 * 
 * Handles:
 * 1. Matching incoming WhatsApp messages with keyword rules from DB
 * 2. Default reply when no keyword matches (away mode)
 * 3. Sending replies via WhatsApp Cloud API
 */

const axios = require('axios');
const Rule = require('../models/Rule');
const Settings = require('../models/Settings');
const { generateAIReply } = require('./geminiService');

// WhatsApp Cloud API URL
const WA_API_URL = 'https://graph.facebook.com/v18.0';

/**
 * Handle an incoming WhatsApp message
 */
async function handleWhatsAppMessage(phoneNumberId, senderPhone, messageText) {
  try {
    // Get settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    // Check if auto-reply is enabled
    if (!settings.isAutoReplyEnabled) {
      console.log('⏸️ Auto-reply is disabled. Skipping WhatsApp reply.');
      return;
    }

    // Convert message to lowercase for case-insensitive matching
    const lowerMessage = messageText.toLowerCase().trim();

    // Search for matching rules (only whatsapp and both platform rules)
    const rules = await Rule.find({
      isActive: true,
      platform: { $in: ['whatsapp', 'both'] }
    });

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
    } else if (settings.isAwayMode) {
      // Try Gemini AI first
      const aiReply = await generateAIReply(messageText, '');

      if (aiReply) {
        console.log(`🤖 WhatsApp: AI reply generated.`);
        await sendWhatsAppMessage(phoneNumberId, senderPhone, aiReply);
      } else {
        console.log(`🌙 WhatsApp: AI unavailable, sending default reply.`);
        await sendWhatsAppMessage(phoneNumberId, senderPhone, settings.defaultReply);
      }
    } else {
      console.log(`ℹ️ WhatsApp: No keyword matched and away mode is OFF. No reply sent.`);
    }
  } catch (error) {
    console.error('❌ Error handling WhatsApp message:', error.message);
  }
}

/**
 * Send a WhatsApp message via Cloud API
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
