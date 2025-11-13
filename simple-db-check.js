const mongoose = require('mongoose');

// Local MongoDB connection
const LOCAL_DB_URI = 'mongodb://localhost:27017/rms_db';

console.log('Checking local MongoDB database...');
console.log('Local DB URI:', LOCAL_DB_URI);

async function checkDatabase() {
  try {
    // Connect to local MongoDB
    await mongoose.connect(LOCAL_DB_URI);
    console.log('Connected to local MongoDB');
    
    // Get model names from mongoose
    const modelNames = Object.keys(mongoose.models);
    console.log('Registered models:', modelNames);
    
    // Check if we can list collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));
    
    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error checking database:', error.message);
  }
}

// Run the check
checkDatabase();