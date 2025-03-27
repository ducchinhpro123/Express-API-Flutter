const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// All order routes require authentication
router.use(protect);

// Get all orders (users see their own, admins see all)
router.get('/', orderController.getAllOrders);

// Get a single order by id
router.get('/:id', orderController.getOrderById);

// Create a new order
router.post('/', orderController.createOrder);

// Update order status (admin only)
router.put('/:id/status', authorize('admin'), orderController.updateOrderStatus);

// Cancel order
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;
