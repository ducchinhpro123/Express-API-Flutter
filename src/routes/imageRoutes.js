const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');
const imageController = require('../controllers/imageController');

// Get all product images
router.get('/', (req, res) => {
  try {
    const imagesDir = path.join(__dirname, '../../public/images');
    
    // Check if directory exists
    if (!fs.existsSync(imagesDir)) {
      return res.status(404).json({
        success: false,
        error: 'Images directory not found'
      });
    }
    
    // Read directory
    const files = fs.readdirSync(imagesDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      });
    
    // Create URLs for each image
    const imageUrls = files.map(file => {
      return {
        filename: file,
        url: `/public/images/${file}`
      };
    });
    
    res.status(200).json({
      success: true,
      count: imageUrls.length,
      data: imageUrls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error retrieving images'
    });
  }
});

// Get a specific image
router.get('/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, `../../public/images/${filename}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error retrieving image'
    });
  }
});

// Upload a product image (admin only)
router.post('/upload', protect, authorize('admin'), imageController.uploadProductImage);

// Delete a product image (admin only)
router.delete('/:filename', protect, authorize('admin'), imageController.deleteProductImage);

module.exports = router;
