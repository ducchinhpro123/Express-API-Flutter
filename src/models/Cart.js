const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1.'],
    default: 1,
  },
  // You might want to store price here as well in case product price changes
  price: {
    type: Number,
    required: true,
  },
  name: { // Store name for easier display in cart
    type: String,
    required: true,
  },
  image: { // Store image for easier display in cart
    type: String,
  }
});

const CartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Each user should have only one cart
    },
    items: [CartItemSchema],
    // You could add timestamps if needed
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
    toJSON: { virtuals: true }, // Ensure virtuals are included when converting to JSON
    toObject: { virtuals: true }
  }
);

// Virtual for calculating total price
CartSchema.virtual('totalPrice').get(function() {
  return this.items.reduce((total, item) => {
    return total + item.quantity * item.price;
  }, 0);
});

// Virtual for calculating total quantity
CartSchema.virtual('totalQuantity').get(function() {
  return this.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
});

// Middleware to update `updatedAt` timestamp on item changes
CartSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.updatedAt = Date.now();
  }
  next();
});


module.exports = mongoose.model('Cart', CartSchema);
