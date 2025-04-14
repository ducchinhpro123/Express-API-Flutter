const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');

// Generate tokens (access token and refresh token)
const generateTokens = (id) => {
  // Generate access token (short-lived)
  const accessToken = jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '1h' }
  );
  
  // Generate refresh token (long-lived)
  const refreshToken = jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Simple validation
    if (!name || !email || !password) {
      return next(new ApiError('Please provide name, email and password', 400));
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError('Email already registered', 400));
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    
    // Remove password from output
    user.password = undefined;
    user.refreshToken = undefined;
    
    res.status(201).json({
      success: true,
      token: accessToken,
      refreshToken: refreshToken,
      data: user
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// User login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Simple validation
    if (!email || !password) {
      return next(new ApiError('Please provide email and password', 400));
    }
    
    // Find user by email and include the password field
    const user = await User.findOne({ email }).select('+password');

    console.log(email);
    console.log(user);

    if (!user) {
      return next(new ApiError('Invalid credentials', 401));
    }
    
    // Validate password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ApiError('Invalid credentials', 401));
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    
    // Remove password from output
    user.password = undefined;
    user.refreshToken = undefined;
    
    res.status(200).json({
      success: true,
      token: accessToken,
      refreshToken: refreshToken,
      data: user
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Get a single user by id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Create a new user
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Simple validation
    if (!name || !email || !password) {
      return next(new ApiError('Please provide name, email and password', 400));
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Update a user
exports.updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new ApiError('User not found', 404));
    }
    
    // Check if user is updating themselves or is admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return next(new ApiError('Not authorized to update this user', 403));
    }
    
    // Update user
    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Delete a user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new ApiError('User not found', 404));
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Refresh Access Token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return next(new ApiError('Refresh token is required', 400));
    }
    
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );
    } catch (error) {
      return next(new ApiError('Invalid or expired refresh token', 401));
    }
    
    // Find user by id and check if refresh token matches
    const user = await User.findById(decoded.id);
    
    if (!user || user.refreshToken !== refreshToken) {
      return next(new ApiError('Invalid refresh token', 401));
    }
    
    // Generate new tokens
    const tokens = generateTokens(user._id);
    
    // Update refresh token in database
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });
    
    // Return new tokens
    res.status(200).json({
      success: true,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    // Get user from request object (added by auth middleware)
    const user = req.user;
    
    if (user) {
      // Clear refresh token
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};
