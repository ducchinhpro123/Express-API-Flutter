const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be a positive number']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Electronics',
      'Clothing',
      'Accessories',
      'Home & Kitchen',
      'Sports',
      'Books',
      'Toys',
      'Beauty',
      'Health',
      'Automotive',
      'Uncategorized'
    ]
  },
  inStock: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: '/public/images/no-image.jpg'
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  quantity: {
    type: Number,
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  featured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  attributes: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model('Product', ProductSchema);
