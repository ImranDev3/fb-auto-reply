/**
 * Messenger Service (Multi-tenant)
 * 
 * Each user has their own page, rules, and settings.
 * When a message comes in:
 * 1. Find which user owns the page (by pageId)
 * 2. Use THAT user's rules and settings
 * 3. Reply using THAT user's page access token
 */

const axios = require('axios');
const Rule = require('../models/Rule');
const Settings = require('../models/Settings');
const User = require('../models/User');
const Product = require('../models/Product');
const { generateAIReply } = require('./geminiService');

const FB_API_URL = 'https://graph.facebook.com/v18.0/me/messages';

/**
 * Handle incoming message - multi-tenant
 */
async function handleIncomingMessage(senderId, messageText, recipientId) {
  try {
    // Find the user who owns this page (recipientId = page ID)
    let user = null;
    let accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

    if (recipientId) {
      user = await User.findOne({ 'pageDetails.pageId': recipientId, isActive: true });
    }

    // If no user found by pageId, try to find any user with a token
    if (!user) {
      user = await User.findOne({ 'pageDetails.pageAccessToken': { $ne: '' }, isActive: true });
    }

    // Use user's token if available
    if (user && user.pageDetails && user.pageDetails.pageAccessToken) {
      accessToken = user.pageDetails.pageAccessToken;
    }

    // Check subscription is active
    if (user && !user.subscription.isActive) {
      console.log(`⏸️ User ${user.email} subscription inactive. Skipping.`);
      return;
    }

    // Get user-specific settings
    let settings;
    if (user) {
      settings = await Settings.findOne({ userId: user._id });
    }
    if (!settings) {
      settings = await Settings.findOne({ userId: { $exists: false } });
    }
    if (!settings) {
      settings = { isAutoReplyEnabled: true, isAwayMode: true, defaultReply: 'Thanks for your message! We will get back to you soon.' };
    }

    // Check if auto-reply is enabled
    if (!settings.isAutoReplyEnabled) {
      console.log('⏸️ Auto-reply disabled for this user.');
      return;
    }

    const lowerMessage = messageText.toLowerCase().trim();

    // Get user-specific rules
    let rules;
    if (user) {
      rules = await Rule.find({ userId: user._id, isActive: true, platform: { $in: ['messenger', 'both'] } });
    }
    // Fallback to global rules if user has no rules
    if (!rules || rules.length === 0) {
      rules = await Rule.find({ userId: { $exists: false }, isActive: true, platform: { $in: ['messenger', 'both'] } });
    }

    // Match keyword
    let matchedRule = null;
    for (const rule of rules) {
      if (lowerMessage.includes(rule.keyword)) {
        matchedRule = rule;
        break;
      }
    }

    if (matchedRule) {
      console.log(`✅ [${user?.email || 'global'}] Keyword "${matchedRule.keyword}" matched.`);
      await sendMessage(senderId, matchedRule.reply, accessToken);
    } else if (settings.isAwayMode) {
      // No keyword matched — try Gemini AI first
      // Build business context from user's business details + products + AI context
      let businessContext = '';

      // Use AI Context (client's custom instructions) as primary source
      if (settings.aiContext) {
        businessContext += settings.aiContext + '\n\n';
      }
      
      if (user) {
        const bd = user.businessDetails || {};
        if (bd.businessName) businessContext += `Business: ${bd.businessName}. `;
        if (bd.category) businessContext += `Category: ${bd.category}. `;
        if (bd.description) businessContext += `About: ${bd.description}. `;
        if (bd.address) businessContext += `Address: ${bd.address}. `;
        if (bd.phone) businessContext += `Phone: ${bd.phone}. `;
        if (bd.website) businessContext += `Website: ${bd.website}. `;

        // Get user's products/services
        const products = await Product.find({ userId: user._id, isAvailable: true });
        if (products.length > 0) {
          businessContext += '\n\nProducts/Services available:\n';
          products.forEach(p => {
            businessContext += `- ${p.name}`;
            if (p.price) businessContext += ` (Price: ${p.price})`;
            if (p.description) businessContext += ` - ${p.description}`;
            businessContext += '\n';
          });
        }
      }

      const aiReply = await generateAIReply(messageText, businessContext);

      if (aiReply) {
        console.log(`🤖 [${user?.email || 'global'}] AI reply generated.`);
        await sendMessage(senderId, aiReply, accessToken);
      } else {
        // Fallback to default reply if AI fails
        console.log(`🌙 [${user?.email || 'global'}] AI unavailable, sending default reply.`);
        await sendMessage(senderId, settings.defaultReply, accessToken);
      }
    } else {
      console.log(`ℹ️ No match, away mode OFF.`);
    }
  } catch (error) {
    console.error('❌ Error handling message:', error.message);
  }
}

/**
 * Send message via Facebook Graph API
 */
async function sendMessage(recipientId, messageText, accessToken) {
  try {
    const token = accessToken || process.env.FB_PAGE_ACCESS_TOKEN;
    await axios.post(FB_API_URL, {
      recipient: { id: recipientId },
      message: { text: messageText }
    }, { params: { access_token: token } });

    console.log(`✅ Reply sent to ${recipientId}`);
  } catch (error) {
    console.error('❌ Send error:', error.response?.data?.error?.message || error.message);
  }
}

module.exports = { handleIncomingMessage, sendMessage };
