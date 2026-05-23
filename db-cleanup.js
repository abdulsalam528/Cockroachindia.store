// db-cleanup.js - Reset test data before E2E tests
const { MongoClient } = require('mongodb');

async function cleanup() {
  const client = await MongoClient.connect('mongodb://localhost:27017/cjp');
  const db = client.db('cjp');
  
  // Delete test users
  const delUsers = await db.collection('users').deleteMany({ 
    email: { $in: ['comrade1@cjp.org', 'admin@cjp.org', 'admin@cockroachindia.shop'] } 
  });
  console.log('Deleted ' + delUsers.deletedCount + ' test users');
  
  // Delete ALL orders (clean slate for test)
  const delOrders = await db.collection('orders').deleteMany({});
  console.log('Deleted ' + delOrders.deletedCount + ' orders');
  
  // Delete all products to trigger a fresh seed with correct variants schema
  const delProducts = await db.collection('products').deleteMany({});
  console.log('Deleted ' + delProducts.deletedCount + ' products (for fresh re-seeding)');
  
  await client.close();
  console.log('Cleanup complete');
}

cleanup()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Cleanup error:', err.message);
    process.exit(1);
  });
