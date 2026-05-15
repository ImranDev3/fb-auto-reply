/**
 * Clear all demo/global rules (rules without userId)
 * Run: node src/clear-demo.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Rule = require('./models/Rule');

async function clearDemo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all rules that have no userId (global/demo rules)
    const result = await Rule.deleteMany({ userId: { $exists: false } });
    console.log(`✅ Deleted ${result.deletedCount} demo rules.`);

    // Also delete rules with null userId
    const result2 = await Rule.deleteMany({ userId: null });
    console.log(`✅ Deleted ${result2.deletedCount} null-user rules.`);

    console.log('🎉 All demo rules cleared! Only client-specific rules remain.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearDemo();
