/**
 * Script to verify the admin account exists in the database
 * 
 * Usage: node verifyAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

// Admin email to verify
const adminEmail = 'admin123@gmail.com';

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  verifyAdmin();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Function to verify admin user
async function verifyAdmin() {
  try {
    // Find admin by email
    const admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('Admin account found:');
      console.log(`- ID: ${admin._id}`);
      console.log(`- Name: ${admin.name}`);
      console.log(`- Email: ${admin.email}`);
      console.log(`- Role: ${admin.role}`);
      console.log(`- Created At: ${admin.createdAt}`);
    } else {
      console.log(`No user found with email: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Error verifying admin account:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
} 