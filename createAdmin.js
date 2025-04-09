/**
 * Script to create an admin account in the database
 * This script should be run once to set up the initial admin
 * 
 * Usage: node createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

// Admin credentials
const adminEmail = 'admin2@gmail.com';
const adminPassword = '123@123';
const adminName = 'Admin User';

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  createAdmin();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Function to create admin user
async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin account already exists.');
    } else {

      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });

      await admin.save({ validateBeforeSave: false });

      console.log('Admin account created successfully.');
    }
  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}
