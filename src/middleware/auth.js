const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

// JWT secret keys
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

/**
 * Middleware to protect routes requiring authentication
 */
const protect = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return next(new ApiError('Authentication token is missing', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find user by id (excluding password)
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new ApiError('User not found', 404));
      }
      
      // Add user to request
      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError('Token has expired, please login again', 401));
      } else if (err.name === 'JsonWebTokenError') {
        return next(new ApiError('Invalid token', 401));
      } else {
        return next(new ApiError('Authentication failed', 401));
      }
    }
  } catch (error) {
    next(new ApiError('Server error during authentication', 500));
  }
};

/**
 * Middleware to restrict access by role
 * @param  {...string} roles - Array of roles that have access
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('Not authorized to access this route', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    
    next();
  };
};

/**
 * Middleware to verify refresh tokens
 */
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return next(new ApiError('Refresh token is required', 400));
    }
    
    // Verify refresh token
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      
      // Find user with matching refresh token
      const user = await User.findById(decoded.id).select('+refreshToken');
      
      if (!user || user.refreshToken !== refreshToken) {
        return next(new ApiError('Invalid refresh token', 401));
      }
      
      // Add user to request
      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError('Refresh token has expired, please login again', 401));
      } else {
        return next(new ApiError('Invalid refresh token', 401));
      }
    }
  } catch (error) {
    next(new ApiError('Server error during token verification', 500));
  }
};

module.exports = { protect, authorize, verifyRefreshToken };
