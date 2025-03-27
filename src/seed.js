require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('./lib/db');
const User = require('./models/User');
const Product = require('./models/Product');
const { downloadProductImages } = require('./utils/imageDownloader');

// Sample users
const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    password: 'password123'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'admin',
    password: 'password123'
  },
  {
    name: 'Flutter Dev',
    email: 'flutter@example.com',
    role: 'developer',
    password: 'password123'
  }
];

// Sample products with updated image paths
const products = [
  {
    name: 'Smartphone X',
    description: 'Latest smartphone with incredible features',
    price: 699.99,
    category: 'Electronics',
    inStock: true,
    image: '/public/images/smartphone.jpg',
    quantity: 50,
    rating: 4.5
  },
  {
    name: 'Laptop Pro',
    description: 'High performance laptop for professionals',
    price: 1299.99,
    category: 'Electronics',
    inStock: true,
    image: '/public/images/laptop.jpg',
    quantity: 25,
    rating: 4.8
  },
  {
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling headphones',
    price: 149.99,
    category: 'Electronics',
    inStock: true,
    image: '/public/images/headphones.jpg',
    quantity: 100,
    rating: 4.2
  },
  {
    name: 'Running Shoes',
    description: 'Comfortable shoes for running and sports',
    price: 89.99,
    category: 'Sports',
    inStock: true,
    image: '/public/images/shoes.jpg',
    quantity: 75,
    rating: 4.3
  },
  {
    name: 'Coffee Maker',
    description: 'Automatic coffee maker for your home',
    price: 59.99,
    category: 'Home & Kitchen',
    inStock: true,
    image: '/public/images/coffeemaker.jpg',
    quantity: 30,
    rating: 4.0
  }
];

// Seed function
const seedDatabase = async () => {
  let connection;
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    connection = await connectDB();
    console.log('Connected to MongoDB successfully');
    
    // First download the images (uncomment this if you want to download images during seeding)
    // console.log('Downloading product images...');
    // await downloadProductImages();
    
    console.log('Clearing existing data...');
    // Clear existing data with explicit timeouts
    await Promise.all([
      User.deleteMany({}).maxTimeMS(60000),  // Increase operation timeout to 60 seconds
      Product.deleteMany({}).maxTimeMS(60000)
    ]);
    
    console.log('Database cleared successfully');
    
    // Hash passwords and create users
    const saltRounds = 10;
    const createdUsers = [];
    
    console.log('Creating users...');
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      const createdUser = await User.create({
        ...user,
        password: hashedPassword
      });
      createdUsers.push(createdUser);
    }
    
    console.log(`${createdUsers.length} users created successfully`);
    
    // Create products
    console.log('Creating products...');
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} products created successfully`);
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    
    // Additional error info for common MongoDB errors
    if (error.name === 'MongoNetworkError') {
      console.error('Network error occurred. Check your connection and MongoDB URI');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server. Check your connection details');
    }
  } finally {
    // Properly close the connection
    if (connection) {
      try {
        console.log('Closing MongoDB connection...');
        await mongoose.disconnect();
        console.log('MongoDB connection closed');
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
      }
    }
    
    // Always exit the process when done
    process.exit(0);
  }
};

// Run the seeder
seedDatabase();
