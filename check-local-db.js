const mongoose = require('mongoose');
require('dotenv').config();

// Local MongoDB connection
const LOCAL_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rms_db';

console.log('Checking local MongoDB database...');
console.log('Local DB URI:', LOCAL_DB_URI);

async function checkDatabase() {
  let connection;
  
  try {
    // Connect to local MongoDB
    connection = await mongoose.createConnection(LOCAL_DB_URI);
    console.log('Connected to local MongoDB');
    
    // Wait for connection to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get collection names
    const collections = await connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));
    
    // Check document count in each collection
    for (const collection of collections) {
      const count = await connection.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
    }
    
  } catch (error) {
    console.error('Error checking database:', error.message);
  } finally {
    // Close connection
    if (connection) {
      await connection.close();
      console.log('Database connection closed');
    }
  }
}

// Run the check
if (require.main === module) {
  checkDatabase();
}