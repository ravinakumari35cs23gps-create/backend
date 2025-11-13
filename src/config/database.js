const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
        // Use MongoDB Atlas in production, fallback to local MongoDB in development
    const dbURI = process.env.NODE_ENV === 'production' ? process.env.MONGODB_ATLAS_URI : process.env.MONGODB_URI;
    const conn = await mongoose.connect(dbURI);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
