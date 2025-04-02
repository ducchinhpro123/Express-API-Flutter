const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

/**
 * Basic rate limiter for all routes
 */
const basicLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes by default
  max: process.env.RATE_LIMIT_MAX || 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    next(new ApiError('Too many requests, please try again later.', 429));
  }
});

/**
 * Stricter rate limiter for authentication routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    next(new ApiError('Too many login attempts, please try again later.', 429));
  }
});

/**
 * Moderate rate limiter for user creation/editing
 */
const userActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    next(new ApiError('Too many user operations, please try again later.', 429));
  }
});

module.exports = {
  basicLimiter,
  authLimiter,
  userActionLimiter
}; 