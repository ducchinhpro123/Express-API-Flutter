const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/products/search
 * @desc    Search products with filtering and sorting
 * @access  Public
 */
router.get('/search', productController.searchProducts);

/**
 * @route   GET /api/products/category/:category
 * @desc    Get products by category
 * @access  Public
 */
router.get('/category/:category', productController.getProductsByCategory);

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product
 * @access  Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Admin only)
 */
router.post('/', protect, authorize('admin'), productController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private (Admin only)
 */
router.put('/:id', protect, authorize('admin'), productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, authorize('admin'), productController.deleteProduct);

module.exports = router;