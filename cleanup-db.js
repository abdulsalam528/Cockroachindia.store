const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/cjp';

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
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
