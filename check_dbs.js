const mongoose = require('mongoose');
async function check(dbName) {
  await mongoose.connect('mongodb+srv://cis_db:admin@cluster0.uoxx7md.mongodb.net/' + dbName + '?appName=Cluster0');
  const count = await mongoose.connection.db.collection('products').countDocuments();
  console.log('DB ' + dbName + ' has ' + count + ' products.');
  await mongoose.disconnect();
}
async function run() {
  await check('cis_db');
  await check('cjp');
  await check('test');
  process.exit(0);
}
run();
