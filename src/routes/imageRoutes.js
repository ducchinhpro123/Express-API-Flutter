const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/images
 * @desc    Get all images
 * @access  Public
 */
router.get('/', imageController.getAllImages);

/**
 * @route   GET /api/images/:filename
 * @desc    Get a specific image (with optional resizing parameters)
 * @access  Public
 * @query   width - Optional width in pixels
 * @query   height - Optional height in pixels
 * @query   format - Optional format (jpeg, png, webp)
 * @query   quality - Optional quality (1-100)
 */
router.get('/:filename', imageController.getImageByFilename);

/**
 * @route   POST /api/images/upload
 * @desc    Upload a new image
 * @access  Private (Admin only)
 */
router.post('/upload', protect, authorize('admin'), imageController.uploadImage);

/**
 * @route   DELETE /api/images/:filename
 * @desc    Delete an image
 * @access  Private (Admin only)
 */
router.delete('/:filename', protect, authorize('admin'), imageController.deleteImage);

module.exports = router;
