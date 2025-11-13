const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./src/models/User');

// Local MongoDB connection
const LOCAL_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rms_db';

// MongoDB Atlas connection
const ATLAS_DB_URI = process.env.MONGODB_ATLAS_URI || 'mongodb+srv://ravinakumari3106_db_user:kGoPlzCzhvXqmtye@cluster0.2x6vduc.mongodb.net/rms_db?retryWrites=true&w=majority';

console.log('Starting User data migration from local MongoDB to MongoDB Atlas...');
console.log('Local DB URI:', LOCAL_DB_URI);
console.log('Atlas DB URI:', ATLAS_DB_URI);

async function migrateUsers() {
  let localConnection, atlasConnection;
  
  try {
    console.log('Connecting to databases...');
    
    // Connect to local MongoDB
    localConnection = await mongoose.createConnection(LOCAL_DB_URI);
    console.log('Connected to local MongoDB');
    
    // Connect to MongoDB Atlas
    atlasConnection = await mongoose.createConnection(ATLAS_DB_URI);
    console.log('Connected to MongoDB Atlas');
    
    // Create models for both connections
    const LocalUser = localConnection.model('User', User.schema);
    const AtlasUser = atlasConnection.model('User', User.schema);
    
    console.log('Fetching users from local database...');
    const users = await LocalUser.find({}).select('+passwordHash');
    console.log(`Found ${users.length} users in local database`);
    
    if (users.length === 0) {
      console.log('No users to migrate');
      return;
    }
    
    // Log first user to see structure
    console.log('First user sample:', JSON.stringify(users[0].toObject(), null, 2));
    
    console.log('Migrating users to Atlas...');
    try {
      // Try inserting one by one to see what happens
      let successCount = 0;
      for (let i = 0; i < users.length; i++) {
        try {
          const userDoc = users[i].toObject();
          // Remove virtuals and other non-document properties
          delete userDoc.fullName;
          delete userDoc.id;
          
          await AtlasUser.create(userDoc);
          successCount++;
          console.log(`Successfully inserted user ${i+1}: ${userDoc.email}`);
        } catch (docError) {
          console.error(`Error inserting user ${i}:`, docError.message);
          console.error('User data:', JSON.stringify(users[i].toObject(), null, 2));
        }
      }
      console.log(`Successfully migrated ${successCount} users individually`);
    } catch (insertError) {
      console.error('Error inserting users:', insertError.message);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close connections
    if (localConnection) {
      await localConnection.close();
      console.log('Local database connection closed');
    }
    
    if (atlasConnection) {
      await atlasConnection.close();
      console.log('Atlas database connection closed');
    }
  }
}

// Run the migration
migrateUsers();