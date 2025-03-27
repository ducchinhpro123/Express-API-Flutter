const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
// Get all products
router.get('/', productController.getAllProducts);

// Get a single product by id
router.get('/:id', productController.getProductById);

// Get products by category
router.get('/category/:category', productController.getProductsByCategory);

// Protected routes (admin only)
// Create a new product
router.post('/', protect, authorize('admin'), productController.createProduct);

// Update a product
router.put('/:id', protect, authorize('admin'), productController.updateProduct);

// Delete a product
router.delete('/:id', protect, authorize('admin'), productController.deleteProduct);

module.exports = router;