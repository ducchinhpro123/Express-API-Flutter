const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const ApiError = require('../utils/ApiError');

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

// Utility to ensure the images directory exists
const ensureImageDirExists = async () => {
  const publicDir = path.join(__dirname, '../../public');
  const imagesDir = path.join(publicDir, 'images');

  try {
    // Check if public directory exists
    try {
      await access(publicDir);
    } catch (error) {
      await promisify(fs.mkdir)(publicDir);
    }

    // Check if images directory exists
    try {
      await access(imagesDir);
    } catch (error) {
      await promisify(fs.mkdir)(imagesDir);
    }

    return imagesDir;
  } catch (error) {
    throw new Error(`Error ensuring image directory exists: ${error.message}`);
  }
};

// Upload a product image
exports.uploadProductImage = async (req, res, next) => {
  try {
    // Check if file exists in request
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.image) {
      return next(new ApiError('No image uploaded', 400));
    }

    const file = req.files.image;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return next(new ApiError('Please upload a valid image (JPEG, PNG, WEBP)', 400));
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return next(new ApiError('Image size should be less than 5MB', 400));
    }

    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.name);
    const filename = `product-${uniqueSuffix}${extension}`;

    // Ensure directory exists
    const imagesDir = await ensureImageDirExists();
    const filepath = path.join(imagesDir, filename);

    // Save the file
    await writeFile(filepath, file.data);

    // Create the URL path for the image
    const imagePath = `/public/images/${filename}`;
    const imageUrl = `${req.protocol}://${req.get('host')}${imagePath}`;

    res.status(200).json({
      success: true,
      data: {
        filename,
        filepath: imagePath,
        url: imageUrl
      }
    });
  } catch (error) {
    next(new ApiError(`Error uploading image: ${error.message}`, 500));
  }
};

// Delete a product image
exports.deleteProductImage = async (req, res, next) => {
  try {
    const { filename } = req.params;

    // Prevent path traversal attacks
    if (filename.includes('..') || filename.includes('/')) {
      return next(new ApiError('Invalid filename', 400));
    }

    const filepath = path.join(__dirname, '../../public/images', filename);

    // Check if file exists
    try {
      await access(filepath, fs.constants.F_OK);
    } catch (error) {
      return next(new ApiError('Image not found', 404));
    }

    // Delete the file
    await unlink(filepath);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(new ApiError(`Error deleting image: ${error.message}`, 500));
  }
};
