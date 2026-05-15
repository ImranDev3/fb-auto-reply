require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const users = await User.find().select('name email role subscription isActive pageDetails.pageName');
  console.log('All users in database:');
  users.forEach(u => {
    console.log(`  Name: ${u.name}`);
    console.log(`  Email: ${u.email}`);
    console.log(`  Role: ${u.role}`);
    console.log(`  Plan: ${u.subscription.plan} (Max: ${u.subscription.maxRules})`);
    console.log(`  Active: ${u.isActive}`);
    console.log(`  Page: ${u.pageDetails?.pageName || 'Not set'}`);
    console.log('  ---');
  });
  console.log(`Total: ${users.length} users`);
  process.exit(0);
});
