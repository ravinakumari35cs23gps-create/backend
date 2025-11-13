const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const User = require('./src/models/User');
const Student = require('./src/models/Student');
const Teacher = require('./src/models/Teacher');
const Subject = require('./src/models/Subject');
const Class = require('./src/models/Class');
const Result = require('./src/models/Result');
const Attendance = require('./src/models/Attendance');
const Notification = require('./src/models/Notification');
const Audit = require('./src/models/Audit');
const Config = require('./src/models/Config');

// Local MongoDB connection
const LOCAL_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rms_db';

// MongoDB Atlas connection
const ATLAS_DB_URI = process.env.MONGODB_ATLAS_URI || 'mongodb+srv://ravinakumari3106_db_user:kGoPlzCzhvXqmtye@cluster0.2x6vduc.mongodb.net/rms_db?retryWrites=true&w=majority';

console.log('Starting data migration from local MongoDB to MongoDB Atlas...');
console.log('Local DB URI:', LOCAL_DB_URI);
console.log('Atlas DB URI:', ATLAS_DB_URI);

// Models to migrate (in order of dependencies)
const MODELS = [
  { name: 'Config', model: Config },
  { name: 'User', model: User },
  { name: 'Subject', model: Subject },
  { name: 'Class', model: Class },
  { name: 'Student', model: Student },
  { name: 'Teacher', model: Teacher },
  { name: 'Result', model: Result },
  { name: 'Attendance', model: Attendance },
  { name: 'Notification', model: Notification },
  { name: 'Audit', model: Audit }
];

async function connectToDatabases() {
  console.log('Connecting to databases...');
  
  // Connect to local MongoDB
  const localConnection = await mongoose.createConnection(LOCAL_DB_URI);
  console.log('Connected to local MongoDB');
  
  // Connect to MongoDB Atlas
  const atlasConnection = await mongoose.createConnection(ATLAS_DB_URI);
  console.log('Connected to MongoDB Atlas');
  
  return { localConnection, atlasConnection };
}

async function migrateCollection(localConnection, atlasConnection, modelName, modelSchema) {
  console.log(`Migrating ${modelName} collection...`);
  
  try {
    // Create models for both connections
    const LocalModel = localConnection.model(modelName, modelSchema);
    const AtlasModel = atlasConnection.model(modelName, modelSchema);
    
    // Fetch all documents from local database
    // For User model, we need to explicitly select passwordHash field
    let query = LocalModel.find({});
    if (modelName === 'User') {
      query = query.select('+passwordHash');
    }
    const documents = await query;
    console.log(`Found ${documents.length} ${modelName} documents in local database`);
    
    if (documents.length === 0) {
      console.log(`No ${modelName} documents to migrate`);
      return 0;
    }
    
    // Clear existing data in Atlas (optional, uncomment if needed)
    // await AtlasModel.deleteMany({});
    // console.log(`Cleared existing ${modelName} documents in Atlas`);
    
    // Insert documents to Atlas
    const result = await AtlasModel.insertMany(documents, { ordered: false });
    console.log(`Successfully migrated ${result.length} ${modelName} documents to Atlas`);
    
    return result.length;
  } catch (error) {
    console.error(`Error migrating ${modelName}:`, error.message);
    return 0;
  }
}

async function runSeeder() {
  let localConnection, atlasConnection;
  
  try {
    // Connect to both databases
    const connections = await connectToDatabases();
    localConnection = connections.localConnection;
    atlasConnection = connections.atlasConnection;
    
    let totalMigrated = 0;
    
    // Migrate each model
    for (const { name, model } of MODELS) {
      const count = await migrateCollection(localConnection, atlasConnection, name, model.schema);
      totalMigrated += count;
    }
    
    console.log(`\nMigration completed! Total documents migrated: ${totalMigrated}`);
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
    
    process.exit(0);
  }
}

// Run the seeder
if (require.main === module) {
  runSeeder();
}

module.exports = { runSeeder };