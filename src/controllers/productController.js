const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    // Build query
    let query;
    
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    query = Product.find(JSON.parse(queryStr));
    
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments();
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const products = await query;
    
    // Format product data to include absolute image URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const formattedProducts = products.map(product => {
      const productObj = product.toObject();
      
      // Convert relative image paths to absolute URLs
      if (productObj.image && !productObj.image.startsWith('http')) {
        productObj.image = `${baseUrl}${productObj.image}`;
      }
      
      return productObj;
    });
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: formattedProducts.length,
      pagination,
      data: formattedProducts
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Get a single product by id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ApiError('Product not found', 404));
    }
    
    // Format product data to include absolute image URL
    const productObj = product.toObject();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Convert relative image path to absolute URL
    if (productObj.image && !productObj.image.startsWith('http')) {
      productObj.image = `${baseUrl}${productObj.image}`;
    }

    res.status(200).json({
      success: true,
      data: productObj
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Create a new product
exports.createProduct = async (req, res, next) => {
  try {
    // Validate required fields
    const { name, description, price, category } = req.body;
    
    if (!name || !description || !price || !category) {
      return next(new ApiError('Please provide name, description, price and category', 400));
    }
    
    // Create product
    const product = await Product.create(req.body);
    
    // Format response with absolute image URL
    const productObj = product.toObject();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    if (productObj.image && !productObj.image.startsWith('http')) {
      productObj.image = `${baseUrl}${productObj.image}`;
    }
    
    res.status(201).json({
      success: true,
      data: productObj
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Update a product
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ApiError('Product not found', 404));
    }
    
    // Check if updating image and old image exists
    const oldImage = product.image;
    const newImage = req.body.image;
    
    // Update the product
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    // Delete old image if it's being replaced and not the default image
    if (oldImage && newImage && oldImage !== newImage && 
        !oldImage.includes('no-image.jpg') && oldImage.startsWith('/public/images/')) {
      try {
        const oldImagePath = path.join(__dirname, '../..', oldImage);
        // Check if file exists before attempting to delete
        await access(oldImagePath, fs.constants.F_OK);
        await unlink(oldImagePath);
      } catch (err) {
        // Just log the error, don't prevent the update
        console.error(`Failed to delete old image: ${err.message}`);
      }
    }
    
    // Format response with absolute image URL
    const productObj = product.toObject();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    if (productObj.image && !productObj.image.startsWith('http')) {
      productObj.image = `${baseUrl}${productObj.image}`;
    }
    
    res.status(200).json({
      success: true,
      data: productObj
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Delete a product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ApiError('Product not found', 404));
    }
    
    // Delete associated image if it's not the default image
    if (product.image && !product.image.includes('no-image.jpg') && 
        product.image.startsWith('/public/images/')) {
      try {
        const imagePath = path.join(__dirname, '../..', product.image);
        // Check if file exists before attempting to delete
        await access(imagePath, fs.constants.F_OK);
        await unlink(imagePath);
      } catch (err) {
        // Just log the error, don't prevent the delete
        console.error(`Failed to delete product image: ${err.message}`);
      }
    }
    
    await product.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    
    // Find products by category
    const products = await Product.find({ category });
    
    // Format response with absolute image URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const formattedProducts = products.map(product => {
      const productObj = product.toObject();
      
      if (productObj.image && !productObj.image.startsWith('http')) {
        productObj.image = `${baseUrl}${productObj.image}`;
      }
      
      return productObj;
    });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: formattedProducts
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Add search products functionality
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, inStock, sort, limit = 10, page = 1 } = req.query;
    
    // Base query object
    const query = {};
    
    // Add text search if query is provided
    if (q) {
      query.$text = { $search: q };
    }
    
    // Add category filter
    if (category) {
      query.category = category;
    }
    
    // Add price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Add stock filter
    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }
    
    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    
    // Build the aggregation pipeline
    const pipeline = [
      { $match: query },
    ];
    
    // Add sorting
    if (sort) {
      const sortObject = {};
      const sortFields = sort.split(',');
      
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortObject[field.substring(1)] = -1;
        } else {
          sortObject[field] = 1;
        }
      });
      
      pipeline.push({ $sort: sortObject });
    } else {
      // Default sort by score (if text search) or by createdAt
      pipeline.push({ 
        $sort: q ? { score: { $meta: 'textScore' }, createdAt: -1 } : { createdAt: -1 } 
      });
    }
    
    // Add projection for text score if searching
    if (q) {
      pipeline.push({ 
        $addFields: { score: { $meta: 'textScore' } } 
      });
    }
    
    // Count total results (using a copy of the match stage)
    const totalResults = await Product.countDocuments(query);
    
    // Add pagination
    pipeline.push({ $skip: startIndex });
    pipeline.push({ $limit: limitNum });
    
    // Execute the aggregation
    const products = await Product.aggregate(pipeline);
    
    // Format product data to include absolute image URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const formattedProducts = products.map(product => {
      // Convert relative image paths to absolute URLs
      if (product.image && !product.image.startsWith('http')) {
        product.image = `${baseUrl}${product.image}`;
      }
      
      return product;
    });
    
    // Prepare pagination info
    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(totalResults / limitNum),
      totalItems: totalResults,
      hasMore: pageNum < Math.ceil(totalResults / limitNum),
      limit: limitNum
    };
    
    // Return the results
    res.status(200).json({
      success: true,
      count: formattedProducts.length,
      pagination,
      data: formattedProducts
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};
