require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const userModel = require(path.join(__dirname, '..', 'models', 'userModels'));

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGO || process.env.MONGO_DB;
  if (!uri) {
    console.error('MONGO_URI (or MONGO_URL) is not set in .env. Please set it and try again.');
    process.exit(1);
  }

  console.log('Connecting to', uri.split('?')[0]);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const users = await userModel.find({ $or: [{ createdAt: { $exists: false } }, { createdAt: null }] });
  console.log(`Found ${users.length} users missing createdAt`);

  let updated = 0;
  for (const u of users) {
    const ts = u._id.getTimestamp();
    await userModel.updateOne({ _id: u._id }, { $set: { createdAt: ts, updatedAt: ts } });
    console.log(`Updated user ${u._id} -> createdAt ${ts.toISOString()}`);
    updated++;
  }

  console.log(`Done. Updated ${updated} users.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
