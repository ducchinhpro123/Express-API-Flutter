const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);

// Create the public/images directory if it doesn't exist
const createDirectories = async () => {
  const publicDir = path.join(__dirname, '../../public');
  const imagesDir = path.join(publicDir, 'images');

  try {
    // Check if public directory exists
    try {
      await access(publicDir);
    } catch (error) {
      await mkdir(publicDir);
      console.log('Created public directory');
    }

    // Check if images directory exists
    try {
      await access(imagesDir);
    } catch (error) {
      await mkdir(imagesDir);
      console.log('Created images directory');
    }

    return imagesDir;
  } catch (error) {
    console.error('Error creating directories:', error);
    throw error;
  }
};

// Download an image from URL
const downloadImage = (url, filename) => {
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

// Save the image to the file system
const saveImage = async (imagesDir, filename, data) => {
  const filePath = path.join(imagesDir, filename);
  await writeFile(filePath, data);
  return filePath;
};

// Main function to download product images
const downloadProductImages = async () => {
  try {
    const imagesDir = await createDirectories();
    
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
        await saveImage(imagesDir, image.name, imageData);
        console.log(`Successfully downloaded and saved ${image.name}`);
      } catch (error) {
        console.error(`Error processing ${image.name}:`, error.message);
      }
    }
    
    console.log('All product images have been downloaded successfully!');
    return imagesDir;
  } catch (error) {
    console.error('Error in downloadProductImages:', error);
    throw error;
  }
};

module.exports = { downloadProductImages };
