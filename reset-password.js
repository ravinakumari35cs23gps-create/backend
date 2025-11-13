require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    // Get email from command line argument
    const email = process.argv[2];
    const newPassword = process.argv[3] || 'password123';
    
    if (!email) {
      console.log('Usage: node reset-password.js <email> [newPassword]');
      console.log('Example: node reset-password.js user@example.com myNewPass123\n');
      
      // Show available users
      const users = await User.find({}, 'email role');
      console.log('Available users:');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`);
      });
      
      await mongoose.disconnect();
      return;
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found.`);
      await mongoose.disconnect();
      return;
    }
    
    // Update password
    user.passwordHash = newPassword;
    await user.save();
    
    console.log(`✅ Password reset successful!`);
    console.log(`Email: ${email}`);
    console.log(`New Password: ${newPassword}`);
    console.log(`Role: ${user.role}\n`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetPassword();
