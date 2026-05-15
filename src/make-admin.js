/**
 * Make a user admin
 * Usage: node src/make-admin.js your@email.com
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const email = process.argv[2];

if (!email) {
  console.log('Usage: node src/make-admin.js your@email.com');
  process.exit(1);
}

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User with email "${email}" not found.`);
      console.log('Register first at /login, then run this script.');
      process.exit(1);
    }

    user.role = 'admin';
    user.subscription.plan = 'enterprise';
    user.subscription.maxRules = 99999;
    await user.save();

    console.log(`✅ User "${user.name}" (${email}) is now ADMIN!`);
    console.log(`   Plan: Enterprise (unlimited rules)`);
    console.log(`   Access: /admin panel`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

makeAdmin();
