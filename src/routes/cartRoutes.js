const express = require('express');
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth'); // Assuming auth middleware is named 'protect'

const router = express.Router();

// All cart routes are protected
router.use(protect);

router.route('/')
  .get(getCart)       // Get the user's cart
  .delete(clearCart); // Clear the entire cart

router.route('/items')
  .post(addItem);     // Add an item to the cart

router.route('/items/:itemId')
  .put(updateItem)    // Update quantity of a specific item
  .delete(removeItem);// Remove a specific item

module.exports = router;
