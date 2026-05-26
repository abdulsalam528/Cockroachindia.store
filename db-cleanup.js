const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

async function cleanup() {
  const envPath = path.join(__dirname, '.env.local');
  let mongodbUri = 'mongodb://localhost:27017/cis_db';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI\s*=\s*([^\r\n]*)/);
    if (match && match[1]) {
      mongodbUri = match[1].trim();
    }
  }
  
  console.log('Connecting to:', mongodbUri.split('@')[1] || mongodbUri);
  const client = await MongoClient.connect(mongodbUri);
  // Get database name from connection string if present
  let dbName = 'cis_db';
  const urlParts = mongodbUri.split('/');
  if (urlParts.length > 3) {
    dbName = urlParts[3].split('?')[0];
  }
  const db = client.db(dbName);
  
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
