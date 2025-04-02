const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const crypto = require('crypto');
const sharp = require('sharp');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

// Base directories
const publicDir = path.join(__dirname, '../../public');
const imagesDir = path.join(publicDir, 'images');
const cachesDir = path.join(publicDir, 'cache');

/**
 * Create necessary directories for image storage
 */
const createDirectories = async () => {
  try {
    // Check and create public directory
    try {
      await access(publicDir);
    } catch (error) {
      await mkdir(publicDir);
      console.log('Created public directory');
    }

    // Check and create images directory
    try {
      await access(imagesDir);
    } catch (error) {
      await mkdir(imagesDir);
      console.log('Created images directory');
    }

    // Check and create cache directory
    try {
      await access(cachesDir);
    } catch (error) {
      await mkdir(cachesDir);
      console.log('Created cache directory');
    }

    return { publicDir, imagesDir, cachesDir };
  } catch (error) {
    console.error('Error creating directories:', error);
    throw error;
  }
};

/**
 * Download an image from URL
 */
const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image, status code: ${response.statusCode}`));
        return;
      }

      const data = [];
      response.on('data', (chunk) => {
        data.push(chunk);
      });

      response.on('end', () => {
        resolve(Buffer.concat(data));
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

/**
 * Generate a unique filename for an uploaded image
 */
const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const hash = crypto.createHash('md5')
    .update(`${originalFilename}-${timestamp}-${Math.random()}`)
    .digest('hex')
    .substring(0, 8);
  
  const ext = path.extname(originalFilename).toLowerCase();
  return `${hash}-${timestamp}${ext}`;
};

/**
 * Resize an image to specified dimensions
 */
const resizeImage = async (imageBuffer, width, height, options = {}) => {
  try {
    const sharpInstance = sharp(imageBuffer);
    
    // Get image metadata
    const metadata = await sharpInstance.metadata();
    
    // Determine output format based on input or specified format
    const format = options.format || metadata.format || 'jpeg';
    
    // Resize options
    const resizeOptions = {
      width: width,
      height: height,
      fit: options.fit || 'cover',
      position: options.position || 'centre',
      background: options.background || { r: 255, g: 255, b: 255, alpha: 1 }
    };
    
    // Only specify height if it's provided
    if (!height) {
      delete resizeOptions.height;
    }
    
    // Process the image
    return await sharpInstance
      .resize(resizeOptions)
      .toFormat(format, { quality: options.quality || 80 })
      .toBuffer();
  } catch (error) {
    console.error('Error resizing image:', error);
    throw error;
  }
};

/**
 * Save an image buffer to disk
 */
const saveImage = async (directory, filename, imageBuffer) => {
  const filePath = path.join(directory, filename);
  await writeFile(filePath, imageBuffer);
  return filePath;
};

/**
 * Generate a cache key for an image
 */
const generateCacheKey = (originalPath, width, height, options) => {
  const optionsStr = JSON.stringify(options || {});
  return crypto.createHash('md5')
    .update(`${originalPath}-${width}-${height}-${optionsStr}`)
    .digest('hex');
};

/**
 * Process and resize an image for response
 */
const processImage = async (imagePath, width, height, options = {}) => {
  try {
    // Generate cache key
    const cacheKey = generateCacheKey(imagePath, width, height, options);
    const cacheFilePath = path.join(cachesDir, `${cacheKey}.${options.format || 'jpg'}`);
    
    // Check if cached version exists
    try {
      await access(cacheFilePath);
      return {
        filePath: cacheFilePath,
        fromCache: true
      };
    } catch (error) {
      // Not in cache, process it
    }
    
    // Read the original image
    const imageBuffer = await readFile(imagePath);
    
    // Resize the image
    const resizedBuffer = await resizeImage(imageBuffer, width, height, options);
    
    // Save to cache
    await saveImage(cachesDir, `${cacheKey}.${options.format || 'jpg'}`, resizedBuffer);
    
    return {
      filePath: cacheFilePath,
      fromCache: false,
      buffer: resizedBuffer
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

/**
 * Upload and process a new image
 */
const uploadImage = async (file, options = {}) => {
  try {
    await createDirectories();
    
    const originalFilename = file.name;
    const uniqueFilename = generateUniqueFilename(originalFilename);
    
    // Create a buffer from the file data
    const imageBuffer = Buffer.from(await file.data);
    
    // Optimize the original image before saving
    let processedBuffer = imageBuffer;
    
    if (options.optimize !== false) {
      processedBuffer = await resizeImage(
        imageBuffer, 
        options.maxWidth || 1200, 
        null, 
        {
          fit: 'inside',
          withoutEnlargement: true,
          format: options.format || 'jpeg',
          quality: options.quality || 80
        }
      );
    }
    
    // Save the processed image
    const savedPath = await saveImage(imagesDir, uniqueFilename, processedBuffer);
    
    // Return the image information
    return {
      filename: uniqueFilename,
      originalFilename: originalFilename,
      filepath: `/public/images/${uniqueFilename}`,
      mimetype: file.mimetype,
      size: processedBuffer.length
    };
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
};

/**
 * Delete an image from the filesystem
 */
const deleteImage = async (filename) => {
  try {
    const filePath = path.join(imagesDir, filename);
    
    // Check if file exists
    await access(filePath);
    
    // Delete the file
    await unlink(filePath);
    
    // Clear any cached versions
    const cachePattern = new RegExp(`^[a-f0-9]+-.*${path.basename(filename, path.extname(filename))}.*$`);
    const cacheFiles = fs.readdirSync(cachesDir);
    
    for (const cacheFile of cacheFiles) {
      if (cachePattern.test(cacheFile)) {
        try {
          await unlink(path.join(cachesDir, cacheFile));
        } catch (error) {
          console.error(`Error deleting cache file ${cacheFile}:`, error);
        }
      }
    }
    
    return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Get an image with specified dimensions
 */
const getImage = async (filename, width, height, options = {}) => {
  try {
    const imagePath = path.join(imagesDir, filename);
    
    // Check if file exists
    await access(imagePath);
    
    // If no resize needed, return the original
    if (!width && !height) {
      return {
        filePath: imagePath,
        fromCache: false
      };
    }
    
    // Process and resize the image
    return await processImage(imagePath, parseInt(width), parseInt(height), options);
  } catch (error) {
    console.error('Error getting image:', error);
    throw error;
  }
};

/**
 * Download product images from urls
 */
const downloadProductImages = async () => {
  await createDirectories();
  
  // Product image definitions
  const imageUrls = [
    {
      name: 'smartphone.jpg',
      url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80'
    },
    {
      name: 'laptop.jpg',
      url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80'
    },
    {
      name: 'headphones.jpg',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
    },
    {
      name: 'shoes.jpg',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'
    },
    {
      name: 'coffeemaker.jpg',
      url: 'https://images.unsplash.com/photo-1570087935000-74a3c7319b75?w=500&q=80'
    },
    {
      name: 'no-image.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/495px-No-Image-Placeholder.svg.png?20200912122019'
    },
    {
      name: 'watch.jpg',
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
    },
    {
      name: 'tablet.jpg',
      url: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=500&q=80'
    }
  ];
  
  // Download and save each image
  for (const image of imageUrls) {
    try {
      // Check if image already exists
      const filePath = path.join(imagesDir, image.name);
      try {
        await access(filePath);
        console.log(`Image ${image.name} already exists, skipping...`);
        continue;
      } catch (error) {
        // File does not exist, proceed with download
      }
      
      console.log(`Downloading ${image.name} from ${image.url}...`);
      const imageData = await downloadImage(image.url);
      
      // Optimize the image before saving
      const optimizedBuffer = await resizeImage(
        imageData, 
        800, 
        null, 
        {
          fit: 'inside',
          withoutEnlargement: true,
          format: 'jpeg',
          quality: 80
        }
      );
      
      await saveImage(imagesDir, image.name, optimizedBuffer);
      console.log(`Successfully downloaded and saved ${image.name}`);
    } catch (error) {
      console.error(`Error processing ${image.name}:`, error.message);
    }
  }
  
  console.log('All product images have been downloaded successfully!');
  return imagesDir;
};

module.exports = {
  createDirectories,
  uploadImage,
  deleteImage,
  getImage,
  downloadProductImages,
  resizeImage,
  generateUniqueFilename
}; 