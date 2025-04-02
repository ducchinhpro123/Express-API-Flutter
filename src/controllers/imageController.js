const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const ApiError = require('../utils/ApiError');
const imageService = require('../utils/imageService');

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

// Get all images
exports.getAllImages = async (req, res, next) => {
  try {
    const imagesDir = path.join(__dirname, '../../public/images');
    const files = fs.readdirSync(imagesDir);
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const images = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    }).map(file => {
      return {
        filename: file,
        url: `${baseUrl}/public/images/${file}`
      };
    });
    
    res.status(200).json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Get a specific image by filename
exports.getImageByFilename = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const { width, height, format, quality } = req.query;
    
    // Process image resize request if dimensions are provided
    try {
      const result = await imageService.getImage(
        filename, 
        width, 
        height, 
        { 
          format: format || 'jpeg',
          quality: quality ? parseInt(quality) : 80
        }
      );
      
      // If we have a buffer, send it directly
      if (result.buffer) {
        const contentType = format === 'png' ? 'image/png' : 
                            format === 'webp' ? 'image/webp' : 
                            'image/jpeg';
        
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
        return res.send(result.buffer);
      }
      
      // Otherwise, send the file
      return res.sendFile(result.filePath, {
        headers: {
          'Cache-Control': 'public, max-age=31536000' // 1 year cache
        }
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return next(new ApiError(`Image ${filename} not found`, 404));
      }
      throw error;
    }
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Upload a new image
exports.uploadImage = async (req, res, next) => {
  try {
    // Check if file exists in the request
    if (!req.files || !req.files.image) {
      return next(new ApiError('Please upload an image file', 400));
    }
    
    const imageFile = req.files.image;
    
    // Check file type
    if (!imageFile.mimetype.startsWith('image')) {
      return next(new ApiError('Please upload an image file', 400));
    }
    
    // Check file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return next(new ApiError('Image size should be less than 5MB', 400));
    }
    
    // Process and upload the image using our service
    const uploadResult = await imageService.uploadImage(imageFile, {
      maxWidth: 1200,
      quality: 80
    });
    
    // Create absolute URL for the image
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    res.status(201).json({
      success: true,
      data: {
        filename: uploadResult.filename,
        originalFilename: uploadResult.originalFilename,
        filepath: uploadResult.filepath,
        url: `${baseUrl}${uploadResult.filepath}`,
        mimetype: uploadResult.mimetype,
        size: uploadResult.size
      }
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Delete an image
exports.deleteImage = async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    // Delete the image using the service
    try {
      await imageService.deleteImage(filename);
      
      res.status(200).json({
        success: true,
        data: { message: 'Image deleted successfully' }
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return next(new ApiError(`Image ${filename} not found`, 404));
      }
      throw error;
    }
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};
