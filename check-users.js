require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find({}, 'email role createdAt');
    console.log('\nRegistered Users:');
    console.log('=================');
    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created: ${user.createdAt}`);
      console.log('---');
    });
    console.log(`\nTotal users: ${users.length}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
