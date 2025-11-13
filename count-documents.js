const mongoose = require('mongoose');

// Local MongoDB connection
const LOCAL_DB_URI = 'mongodb://localhost:27017/rms_db';

console.log('Checking document counts in local MongoDB database...');
console.log('Local DB URI:', LOCAL_DB_URI);

async function countDocuments() {
  try {
    // Connect to local MongoDB
    await mongoose.connect(LOCAL_DB_URI);
    console.log('Connected to local MongoDB');
    
    // List of collections to check
    const collections = [
      'configs',
      'users',
      'subjects',
      'classes',
      'students',
      'teachers',
      'results',
      'attendances',
      'notifications',
      'audits'
    ];
    
    console.log('\nDocument counts:');
    let totalDocuments = 0;
    
    for (const collectionName of collections) {
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        console.log(`${collectionName}: ${count} documents`);
        totalDocuments += count;
      } catch (error) {
        console.log(`${collectionName}: Error counting documents - ${error.message}`);
      }
    }
    
    console.log(`\nTotal documents in database: ${totalDocuments}`);
    
    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error checking database:', error.message);
  }
}

// Run the check
countDocuments();