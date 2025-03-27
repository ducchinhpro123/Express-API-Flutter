const User = require('../models/User');
const ApiError = require('../utils/ApiError');

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
    
    // Generate JWT token
    const token = user.getSignedJwtToken();
    
    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
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
    if (!user) {
      return next(new ApiError('Invalid credentials', 401));
    }
    
    // Validate password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ApiError('Invalid credentials', 401));
    }
    
    // Generate JWT token
    const token = user.getSignedJwtToken();
    
    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
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
