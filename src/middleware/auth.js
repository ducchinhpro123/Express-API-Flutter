const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

// JWT secret key (should be in .env file in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * Middleware to protect routes requiring authentication
 */
const protect = (req, res, next) => {
  try {
    // Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      throw new ApiError('Not authorized to access this route', 401);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Add user to request
      req.user = decoded;
      next();
    } catch (err) {
      throw new ApiError('Not authorized to access this route', 401);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access by role
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

module.exports = { protect, authorize };
