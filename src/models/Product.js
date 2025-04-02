const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be positive']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['electronics', 'clothing', 'home', 'beauty', 'sports', 'food', 'other']
  },
  inStock: {
    type: Boolean,
    default: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: '/public/images/no-image.jpg'
  },
  rating: {
    type: Number,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    min: [0, 'Discount must be at least 0'],
    max: [99, 'Discount cannot be more than 99%'],
    default: 0
  },
  attributes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for text search
ProductSchema.index(
  { 
    name: 'text', 
    description: 'text',
    category: 'text' 
  }, 
  {
    weights: {
      name: 10,
      category: 5,
      description: 1
    },
    name: 'product_text_index'
  }
);

// Create index for category queries
ProductSchema.index({ category: 1 });

// Create index for price queries
ProductSchema.index({ price: 1 });

// Create index for featured products
ProductSchema.index({ featured: 1 });

// Create index for inStock status
ProductSchema.index({ inStock: 1 });

// Pre-save middleware to ensure category is lowercase
ProductSchema.pre('save', function(next) {
  // If category is being modified
  if (this.isModified('category')) {
    // Valid categories
    const validCategories = ['electronics', 'clothing', 'home', 'beauty', 'sports', 'food', 'other'];
    
    // Convert to lowercase
    const lowerCategory = this.category.toLowerCase();
    
    // Check if lowercase version is valid
    if (validCategories.includes(lowerCategory)) {
      this.category = lowerCategory;
    } else {
      // Default to 'other' if not valid
      this.category = 'other';
    }
  }
  
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
