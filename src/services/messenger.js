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
 * Works for ALL clients - finds user by page ID and uses their data
 */
async function handleIncomingMessage(senderId, messageText, recipientId) {
  try {
    console.log(`📩 Message from ${senderId} to page ${recipientId}: "${messageText}"`);

    // Find the user who owns this page (recipientId = page ID)
    let user = null;
    let accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

    // Try to find user by pageId
    if (recipientId) {
      user = await User.findOne({ 'pageDetails.pageId': String(recipientId), isActive: true });
    }

    // If not found by pageId, try by pageAccessToken (for users who haven't set pageId)
    if (!user) {
      // Find any active user with a page token (fallback for single-user setup)
      user = await User.findOne({ 
        'pageDetails.pageAccessToken': { $exists: true, $ne: '' }, 
        isActive: true 
      }).sort({ lastLogin: -1 });
    }

    if (user) {
      console.log(`👤 Matched user: ${user.email} (${user.businessDetails?.businessName || 'No business name'})`);
      accessToken = user.pageDetails.pageAccessToken || process.env.FB_PAGE_ACCESS_TOKEN;
    } else {
      console.log(`⚠️ No user found for page ${recipientId}. Using global token.`);
    }

    // Check subscription is active
    if (user && !user.subscription.isActive) {
      console.log(`⏸️ User ${user.email} subscription inactive. Skipping.`);
      return;
    }

    // Get user-specific settings
    let settings = null;
    if (user) {
      settings = await Settings.findOne({ userId: user._id });
    }
    if (!settings) {
      // Create default settings
      settings = { 
        isAutoReplyEnabled: true, 
        isAwayMode: true, 
        aiContext: '',
        defaultReply: 'Thanks for your message! We will get back to you soon. 🙏' 
      };
    }

    // Check if auto-reply is enabled
    if (!settings.isAutoReplyEnabled) {
      console.log(`⏸️ Auto-reply disabled for ${user?.email || 'global'}.`);
      return;
    }

    const lowerMessage = messageText.toLowerCase().trim();

    // Get user-specific rules ONLY
    let rules = [];
    if (user) {
      rules = await Rule.find({ userId: user._id, isActive: true, platform: { $in: ['messenger', 'both'] } });
    }
    // Also check global rules (without userId)
    if (rules.length === 0) {
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
      // Keyword matched - send rule reply
      console.log(`✅ [${user?.email || 'global'}] Keyword "${matchedRule.keyword}" matched.`);
      await sendMessage(senderId, matchedRule.reply, accessToken);
    } else {
      // No keyword matched - use AI or default reply
      console.log(`🔍 [${user?.email || 'global'}] No keyword match. Trying AI...`);

      // Build context from AI Context + Business Details + Products
      let businessContext = '';

      // 1. AI Context (primary - what client wrote in the AI Reply box)
      if (settings.aiContext) {
        businessContext += settings.aiContext + '\n\n';
      }

      // 2. Business Details
      if (user && user.businessDetails) {
        const bd = user.businessDetails;
        if (bd.businessName) businessContext += `Business Name: ${bd.businessName}. `;
        if (bd.category) businessContext += `Category: ${bd.category}. `;
        if (bd.description) businessContext += `Description: ${bd.description}. `;
        if (bd.address) businessContext += `Address: ${bd.address}. `;
        if (bd.phone) businessContext += `Contact: ${bd.phone}. `;
        if (bd.website) businessContext += `Website: ${bd.website}. `;
      }

      // 3. Products
      if (user) {
        const products = await Product.find({ userId: user._id, isAvailable: true });
        if (products.length > 0) {
          businessContext += '\n\nProducts/Services:\n';
          products.forEach(p => {
            businessContext += `- ${p.name}`;
            if (p.price) businessContext += ` | Price: ${p.price}`;
            if (p.description) businessContext += ` | ${p.description}`;
            if (p.category) businessContext += ` [${p.category}]`;
            businessContext += '\n';
          });
        }
      }

      // Try AI reply
      let replied = false;
      if (businessContext.trim()) {
        const aiReply = await generateAIReply(messageText, businessContext);
        if (aiReply) {
          console.log(`🤖 [${user?.email || 'global'}] AI reply sent.`);
          await sendMessage(senderId, aiReply, accessToken);
          replied = true;
        }
      }

      // Fallback to default reply
      if (!replied && settings.isAwayMode) {
        console.log(`🌙 [${user?.email || 'global'}] Sending default reply.`);
        await sendMessage(senderId, settings.defaultReply || 'Thanks for your message!', accessToken);
      }
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
