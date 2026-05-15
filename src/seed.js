/**
 * Seed Script - Add demo auto-reply rules
 * Run: node src/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Rule = require('./models/Rule');
const Settings = require('./models/Settings');

const demoRules = [
  { keyword: 'hello', reply: 'Hi there! 👋 Thanks for messaging us. How can we help you today?', platform: 'both' },
  { keyword: 'hi', reply: 'Hey! 😊 Welcome! What can we do for you?', platform: 'both' },
  { keyword: 'price', reply: '💰 Our pricing:\n\n🟢 Free Plan: $0/month (5 rules)\n🔵 Pro Plan: $9.99/month (100 rules)\n🟣 Enterprise: $29.99/month (unlimited)\n\nVisit our website for more details!', platform: 'both' },
  { keyword: 'help', reply: '🆘 Sure! I\'m here to help. Please tell me what you need assistance with and we\'ll get back to you shortly.', platform: 'both' },
  { keyword: 'hours', reply: '🕐 Our business hours:\n\nMonday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed\n\nWe\'ll reply to your message as soon as possible!', platform: 'both' },
  { keyword: 'thanks', reply: 'You\'re welcome! 😊 Happy to help. Let us know if you need anything else!', platform: 'both' },
  { keyword: 'order', reply: '📦 To place an order:\n\n1. Visit our website\n2. Browse products\n3. Add to cart\n4. Checkout\n\nNeed help with an existing order? Please share your order ID.', platform: 'both' },
  { keyword: 'contact', reply: '📞 Contact us:\n\n📧 Email: support@autoreplypro.com\n📱 Phone: +880-XXX-XXXXXXX\n🌐 Website: autoreplypro.com\n\nWe typically respond within 1 hour!', platform: 'both' },
  { keyword: 'location', reply: '📍 Our location:\n\nDhaka, Bangladesh\n\nWe serve customers worldwide through our online platform!', platform: 'both' },
  { keyword: 'delivery', reply: '🚚 Delivery Information:\n\n• Inside Dhaka: 1-2 business days\n• Outside Dhaka: 3-5 business days\n• International: 7-14 business days\n\nFree shipping on orders above $50!', platform: 'both' },
  { keyword: 'return', reply: '🔄 Return Policy:\n\nWe accept returns within 7 days of delivery.\n\nConditions:\n• Item must be unused\n• Original packaging required\n• Receipt/proof of purchase needed\n\nContact us to initiate a return.', platform: 'both' },
  { keyword: 'discount', reply: '🎉 Current Offers:\n\n• New customers: 10% OFF (use code: NEW10)\n• Pro Plan: 7-day free trial\n• Annual billing: 20% discount\n\nDon\'t miss out!', platform: 'both' },
  { keyword: 'payment', reply: '💳 Payment Methods:\n\n• bKash\n• Nagad\n• Rocket\n• Bank Transfer\n• Credit/Debit Card\n• PayPal (International)\n\nAll payments are secure and encrypted.', platform: 'both' },
  { keyword: 'bye', reply: 'Goodbye! 👋 Thanks for chatting with us. Have a great day! Feel free to message anytime.', platform: 'both' },
  { keyword: 'good morning', reply: 'Good morning! ☀️ Hope you\'re having a wonderful day. How can we assist you?', platform: 'both' }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if rules already exist (without userId = global demo rules)
    const existingCount = await Rule.countDocuments({ userId: { $exists: false } });
    
    if (existingCount > 0) {
      console.log(`ℹ️ ${existingCount} global rules already exist. Skipping seed.`);
    } else {
      // Insert demo rules (without userId = works for all users as fallback)
      await Rule.insertMany(demoRules);
      console.log(`✅ ${demoRules.length} demo rules added successfully!`);
    }

    // Create default settings if not exists
    const settingsCount = await Settings.countDocuments({});
    if (settingsCount === 0) {
      await Settings.create({
        defaultReply: 'Thanks for your message! 🙏 We\'ll get back to you as soon as possible. In the meantime, feel free to check our FAQ.',
        isAutoReplyEnabled: true,
        isAwayMode: true,
        awayMessage: 'Hi! 🌙 We\'re currently away but your message is important to us. We\'ll respond within a few hours. Thank you for your patience!',
        greetingMessage: 'Welcome! 👋 Thanks for reaching out. How can we help you today?',
        isGreetingEnabled: true
      });
      console.log('✅ Default settings created!');
    }

    console.log('\n🎉 Seed complete! Your bot is ready.');
    console.log('\nDemo rules added:');
    demoRules.forEach(r => console.log(`  🔑 "${r.keyword}" → "${r.reply.substring(0, 50)}..."`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
