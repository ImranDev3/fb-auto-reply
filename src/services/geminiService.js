/**
 * Gemini AI Service
 * 
 * When no keyword rule matches, Gemini AI generates
 * a smart, helpful reply automatically.
 * Uses Google Gemini API (free tier).
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate AI reply using Gemini
 * @param {string} userMessage - The customer's message
 * @param {string} businessContext - Business info for context
 * @returns {string} AI generated reply
 */
async function generateAIReply(userMessage, businessContext = '') {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log('⚠️ GEMINI_API_KEY not set. Skipping AI reply.');
      return null;
    }

    console.log(`🤖 Calling Gemini AI with context length: ${businessContext.length} chars`);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a helpful customer support assistant for a business. 
${businessContext ? `Business Info: ${businessContext}` : ''}

Rules:
- Reply in a friendly, professional tone
- Keep replies short (2-3 sentences max)
- Use emojis sparingly (1-2 max)
- If you don't know something specific, politely say you'll get back to them
- Never make up information about products/prices
- Reply in the same language the customer used

Customer message: "${userMessage}"

Reply:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (text && text.trim()) {
      console.log(`🤖 Gemini AI generated reply: "${text.trim().substring(0, 50)}..."`);
      return text.trim();
    }

    return null;
  } catch (error) {
    console.error('❌ Gemini AI error:', error.message);
    return null;
  }
}

module.exports = { generateAIReply };
