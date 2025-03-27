const ApiError = require('../utils/ApiError');

/**
 * Custom error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.log(`Error: ${err.message}`);

  // Handle specific error types
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ApiError(message, 404);
  }

  // Return error response in a format Flutter can easily parse
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    data: null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  });
};

module.exports = errorHandler;