// Fix product categories

const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

// Log env variables (without sensitive info)
console.log('Environment loaded:', process.env.NODE_ENV);
console.log('MongoDB URI available:', !!process.env.MONGO_URI);

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  fixCategories();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function fixCategories() {
  try {
    // Find all products
    console.log('Finding products...');
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);
    
    if (products.length === 0) {
      console.log('No products found. Database may be empty.');
      mongoose.connection.close();
      return;
    }
    
    // Display all products with their categories
    products.forEach(product => {
      console.log(`Product: ${product.name}, Category: ${product.category}`);
    });
    
    // Valid categories (lowercase)
    const validCategories = ['electronics', 'clothing', 'home', 'beauty', 'sports', 'food', 'other'];
    console.log('Valid categories:', validCategories);
    
    // Keep track of updated products
    let updatedCount = 0;
    
    // Process each product
    for (const product of products) {
      // Get current category
      const currentCategory = product.category;
      
      // Check if category needs to be fixed
      if (!validCategories.includes(currentCategory)) {
        // Try to map to a valid category
        let newCategory = 'other';
        
        // Check if it's a case issue
        const lowerCategory = currentCategory.toLowerCase();
        if (validCategories.includes(lowerCategory)) {
          newCategory = lowerCategory;
        }
        
        console.log(`Fixing product "${product.name}": changing category from "${currentCategory}" to "${newCategory}"`);
        
        // Update the category
        product.category = newCategory;
        await product.save();
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} products with invalid categories`);
    console.log('All done!');
  } catch (error) {
    console.error('Error fixing categories:', error);
  } finally {
    // Close the connection
    console.log('Closing MongoDB connection');
    mongoose.connection.close();
  }
}
