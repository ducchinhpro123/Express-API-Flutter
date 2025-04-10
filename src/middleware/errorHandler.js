const ApiError = require('../utils/ApiError');

/**
 * Custom error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the original error for debugging
  console.error('ERROR:', err);

  let statusCode = 500; // Default to Internal Server Error
  let message = 'Server Error';

  // Check if it's an instance of our custom ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'CastError') {
    // Handle Mongoose CastError (e.g., invalid ObjectId)
    statusCode = 404; // Not Found
    message = `Resource not found with id of ${err.value}`;
  } else if (err.name === 'ValidationError') {
    // Handle Mongoose Validation Error
    statusCode = 400; // Bad Request
    message = Object.values(err.errors).map(e => e.message).join(', ');
  } else if (err.code === 11000) {
    // Handle Mongoose Duplicate Key Error
    statusCode = 400; // Bad Request
    message = `Duplicate field value entered: ${Object.keys(err.keyValue)}`;
  }
  // Add more specific error handling as needed

  // Ensure statusCode is a valid number before sending
  if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
      console.error(`Invalid status code generated: ${statusCode}. Defaulting to 500.`);
      statusCode = 500;
  }


  // Return error response
  res.status(statusCode).json({
    success: false,
    error: message, // Use the determined message
    data: null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  });
};

module.exports = errorHandler;
