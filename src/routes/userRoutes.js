const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize, verifyRefreshToken } = require('../middleware/auth');
const { authLimiter, userActionLimiter } = require('../middleware/rateLimiter');

// Public routes
/**
 * @route   POST /api/users/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', authLimiter, userController.register);

/**
 * @route   POST /api/users/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, userController.login);

/**
 * @route   POST /api/users/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (with valid refresh token)
 */
router.post('/refresh', authLimiter, verifyRefreshToken, userController.refreshToken);

/**
 * @route   POST /api/users/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post('/logout', protect, userController.logout);

// Protected routes
/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/', protect, authorize('admin'), userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', protect, userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Create a new user (admin only)
 * @access  Private (Admin only)
 */
router.post('/', protect, authorize('admin'), userActionLimiter, userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user
 * @access  Private
 */
router.put('/:id', protect, userActionLimiter, userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, authorize('admin'), userActionLimiter, userController.deleteUser);

module.exports = router;