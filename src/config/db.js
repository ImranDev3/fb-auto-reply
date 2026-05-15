/**
 * MongoDB Connection Configuration
 * 
 * This file handles connecting to MongoDB using Mongoose.
 * Connection string is read from .env file.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit if DB connection fails
  }
};

module.exports = connectDB;
