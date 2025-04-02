const express = require('express');
const path = require('path');
const imageService = require('./imageService');

/**
 * Function to set up the static files middleware and download images
 * @param {Express.Application} app - Express application instance
 */
const setupStaticFiles = async (app) => {
  try {
    // Create directories and download product images
    console.log('Setting up product images...');
    const directories = await imageService.createDirectories();
    await imageService.downloadProductImages();
    
    console.log(`Images directory set up at: ${directories.imagesDir}`);
    console.log(`Cache directory set up at: ${directories.cachesDir}`);
    
    // Set up static file serving
    const publicDir = path.join(__dirname, '../../public');
    app.use('/static', express.static(publicDir));
    
    console.log('Static file serving enabled at /static');
  } catch (error) {
    console.error('Error setting up static files:', error);
  }
};

module.exports = { setupStaticFiles };
