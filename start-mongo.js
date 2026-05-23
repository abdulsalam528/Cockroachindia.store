const { MongoMemoryServer } = require('mongodb-memory-server');

async function run() {
  console.log('Starting MongoMemoryServer...');
  
  // Create an in-memory MongoDB instance on port 27017
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'cjp',
      // We can specify a version if needed, or let it download the default
    }
  });

  const uri = mongod.getUri();
  console.log(`MongoMemoryServer started successfully!`);
  console.log(`URI: ${uri}`);
  console.log(`Port: 27017`);
  console.log(`Database Name: cjp`);
  console.log('Keeping server running. Press Ctrl+C to stop.');

  // Handle termination signals
  process.on('SIGINT', async () => {
    console.log('Stopping MongoMemoryServer...');
    await mongod.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('Stopping MongoMemoryServer...');
    await mongod.stop();
    process.exit(0);
  });
}

run().catch(err => {
  console.error('Failed to start MongoMemoryServer:', err);
  process.exit(1);
});
