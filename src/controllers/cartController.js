const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
// Removed: const httpStatus = require('http-status');

// Helper function to get or create a cart for a user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get user's cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming auth middleware adds user to req
    const cart = await getOrCreateCart(userId);
    // Populate product details for items - select only necessary fields
    await cart.populate({
      path: 'items.product',
      select: 'name price image category', // Fixed: changed 'images' to 'image'
    });

    // --- TRANSFORM DATA FOR FRONTEND ---
    const formattedItems = cart.items.map(item => {
      if (!item.product) return null; // Handle potential missing product data
      return {
        id: item.product._id, // Use product ID for linking
        name: item.product.name,
        price: item.product.price,
        // Use the product image directly instead of looking for images array
        image: item.product.image || null,
        quantity: item.quantity,
        // Add any other fields the frontend might need directly from the cart item itself
        cartItemId: item._id // If frontend needs the specific cart item ID
      };
    }).filter(item => item !== null); // Remove any null items from potential errors
    // --- END TRANSFORM ---

    res.status(200).json({ // Use 200 directly
      success: true,
      data: formattedItems, // Send the formatted items
    });
  } catch (error) {
    console.error("Get cart error:", error);
    next(new ApiError('Failed to retrieve cart', 500)); // Use 500 directly
  }
};

// @desc    Add item to cart
// @route   POST /api/v1/cart/items
// @access  Private
exports.addItem = async (req, res, next) => {
  const { productId } = req.body;
  // Ensure quantity is treated as a number, default to 1 if invalid or missing
  let quantity = parseInt(req.body.quantity, 10);
  if (isNaN(quantity) || quantity < 1) {
    quantity = 1; // Default to 1 if parsing fails or value is invalid
  }

  const userId = req.user.id;

  // console.log("Received addItem request:", { userId, productId, quantity }); // Optional more informative log

  if (!productId) { // Simplified validation
    return next(new ApiError('Product ID is required', 400));
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ApiError('Product not found', 404)); // Use 404 directly
    }
    // Optional: Check product stock if you have an inventory system
    // if (product.stock < quantity) {
    //   return next(new ApiError('Insufficient stock', 400)); // Use 400 directly
    // }

    const cart = await getOrCreateCart(userId);
    const existingItemIndex = cart.items.findIndex(item => item.product.equals(productId));

    if (existingItemIndex > -1) {
      // --- FIX: Set quantity instead of adding ---
      // Ensure we don't exceed stock if applicable (add check here if needed)
      cart.items[existingItemIndex].quantity = quantity;
      // Optional: Update price/name if they can change?
      // cart.items[existingItemIndex].price = product.price;
      // cart.items[existingItemIndex].name = product.name;
    } else {
      // Add new item
      // Ensure we don't exceed stock if applicable (add check here if needed)
      cart.items.push({
        product: productId,
        quantity: quantity, // Use the validated quantity
        // --- FIX: Add name and price back for validation ---
        name: product.name,
        price: product.price,
        // No longer need to store image here directly
        // image: product.images ? product.images[0] : null
      });
    }

    await cart.save();
    // Populate product details before sending response
    await cart.populate({
      path: 'items.product',
      select: 'name price image category', // Fixed: changed 'images' to 'image'
    });

    // --- TRANSFORM DATA FOR FRONTEND ---
    const formattedItems = cart.items.map(item => {
      if (!item.product) return null;
      return {
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        // Use the product image directly instead of looking for images array
        image: item.product.image || null,
        quantity: item.quantity,
        cartItemId: item._id
      };
    }).filter(item => item !== null);
    // --- END TRANSFORM ---

    res.status(200).json({ // Use 200 directly
      success: true,
      message: 'Item quantity updated in cart', // Message reflects both add/update
      data: formattedItems, // Send updated formatted items array
    });
  } catch (error) {
    console.error("Add item error:", error);
    next(new ApiError('Failed to update cart item', 500)); // More general error message
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/v1/cart/items/:itemId  (Note: Using cart item ID, not product ID)
// @access  Private
exports.updateItem = async (req, res, next) => {
  const { quantity } = req.body;
  const { itemId } = req.params; // Now using the cart item ID directly
  const userId = req.user.id;

  if (quantity === undefined || quantity < 1) {
    return next(new ApiError('Valid quantity is required', 400));
  }

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new ApiError('Cart not found', 404));
    }

    // Find the item by its MongoDB _id (cart item ID), not by product reference
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

    // Check if item exists
    if (itemIndex === -1) {
      return next(new ApiError('Item not found in cart', 404));
    }

    // Update the quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Populate product details before sending response
    await cart.populate({
        path: 'items.product',
        select: 'name price image category',
    });

    res.status(200).json({ // Use 200 directly
      success: true,
      message: 'Item quantity updated',
      data: cart.items, // Send updated items array
    });
  } catch (error) {
    console.error("Update item error:", error);
    next(new ApiError('Failed to update item quantity', 500)); // Use 500 directly
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/items/:itemId (Note: Using cart item ID)
// @access  Private
exports.removeItem = async (req, res, next) => {
  const { itemId } = req.params; // Now using the cart item ID directly
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new ApiError('Cart not found', 404));
    }

    const initialLength = cart.items.length;
    
    // Find and remove the item by its MongoDB _id (cart item ID)
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    if (cart.items.length === initialLength) {
      return next(new ApiError('Item not found in cart', 404));
    }

    await cart.save();

    // Populate product details before sending response
    await cart.populate({
        path: 'items.product',
        select: 'name price image category', // Fixed: changed 'images' to 'image'
    });

    res.status(200).json({ // Use 200 directly
      success: true,
      message: 'Item removed from cart',
      data: cart.items, // Send updated items array
    });
  } catch (error) {
    console.error("Remove item error:", error);
    next(new ApiError('Failed to remove item from cart', 500)); // Use 500 directly
  }
};

// @desc    Clear all items from cart
// @route   DELETE /api/v1/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ user: userId });

    if (cart) {
      cart.items = [];
      await cart.save();
    }
    // If no cart exists, we can consider it already cleared

    res.status(200).json({ // Use 200 directly
      success: true,
      message: 'Cart cleared successfully',
      data: [], // Send empty array
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    next(new ApiError('Failed to clear cart', 500)); // Use 500 directly
  }
};
