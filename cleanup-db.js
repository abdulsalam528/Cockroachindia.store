const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function run() {
  const envPath = path.join(__dirname, '.env.local');
  let mongodbUri = 'mongodb://localhost:27017/cis_db';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI\s*=\s*([^\r\n]*)/);
    if (match && match[1]) {
      mongodbUri = match[1].trim();
    }
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongodbUri);
    console.log('Connected.');

    // We can clean by collections directly
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);

    if (names.includes('users')) {
      const res = await db.collection('users').deleteMany({
        email: { $in: ['comrade1@cjp.org', 'admin@cjp.org'] }
      });
      console.log('Deleted users:', res.deletedCount);
    }

    if (names.includes('orders')) {
      const res = await db.collection('orders').deleteMany({});
      console.log('Deleted orders:', res.deletedCount);
    }

    if (names.includes('orderitems')) {
      const res = await db.collection('orderitems').deleteMany({});
      console.log('Deleted order items:', res.deletedCount);
    }

    console.log('Cleanup completed successfully.');
  } catch (err) {
    console.error('Cleanup failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
