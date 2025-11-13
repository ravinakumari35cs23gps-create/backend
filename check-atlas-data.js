const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Atlas connection
const ATLAS_DB_URI = process.env.MONGODB_ATLAS_URI || 'mongodb+srv://ravinakumari3106_db_user:kGoPlzCzhvXqmtye@cluster0.2x6vduc.mongodb.net/rms_db?retryWrites=true&w=majority';

console.log('Checking MongoDB Atlas database...');
console.log('Atlas DB URI:', ATLAS_DB_URI);

async function checkAtlasData() {
  let connection;
  
  try {
    // Connect to MongoDB Atlas
    connection = await mongoose.createConnection(ATLAS_DB_URI);
    console.log('Connected to MongoDB Atlas');
    
    // Get collection names
    const collections = await connection.db.listCollections().toArray();
    console.log('Collections in Atlas database:', collections.map(c => c.name));
    
    // Check document count in users collection
    const userCount = await connection.db.collection('users').countDocuments();
    console.log(`Users in Atlas: ${userCount} documents`);
    
    if (userCount > 0) {
      // Show first few users
      const users = await connection.db.collection('users').find().limit(5).toArray();
      console.log('Sample users in Atlas:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking Atlas database:', error.message);
  } finally {
    // Close connection
    if (connection) {
      await connection.close();
      console.log('Atlas database connection closed');
    }
  }
}

// Run the check
checkAtlasData();