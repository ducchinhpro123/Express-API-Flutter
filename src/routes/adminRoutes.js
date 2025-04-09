const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivities } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes in this file are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Define admin routes
router.get('/dashboard', getDashboardStats);
router.get('/activities', getRecentActivities);

module.exports = router;
