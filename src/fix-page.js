require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const user = await User.findOne({ email: 'imranhsn.md@gmail.com' });
  if (!user) { console.log('User not found'); process.exit(1); }

  user.pageDetails.pageName = 'All Premium House';
  user.pageDetails.pageId = '100958692722071';
  user.pageDetails.pageAccessToken = process.env.FB_PAGE_ACCESS_TOKEN;
  await user.save();

  console.log('✅ Page details updated for Imran Hossain:');
  console.log('  Page: All Premium House');
  console.log('  ID: 100958692722071');
  console.log('  Token: Set from env');
  process.exit(0);
});
