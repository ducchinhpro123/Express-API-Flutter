const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
// Get all users - protected, requires authentication
router.get('/', protect, userController.getAllUsers);

// Get a single user by id - protected, requires authentication
router.get('/:id', protect, userController.getUserById);

// Create a new user - protected, admin only
router.post('/', protect, authorize('admin'), userController.createUser);

// Update a user - protected, admin or self
router.put('/:id', protect, userController.updateUser);

// Delete a user - protected, admin only
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;