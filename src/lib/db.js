const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    // Check for MONGO_URI
    if (!process.env.MONGO_URI) {
      console.error('MongoDB URI is missing. Please set MONGO_URI in your .env file');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // Provide more helpful error messages based on error type
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server. Please check:');
      console.error('- Your network connection');
      console.error('- If MongoDB Atlas IP whitelist includes your IP');
      console.error('- If MongoDB Atlas username and password are correct');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
