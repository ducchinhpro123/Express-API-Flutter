const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Example: Calculate recent revenue (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await Order.find({
      createdAt: { $gte: sevenDaysAgo },
      paymentStatus: 'completed', // Consider only completed orders for revenue
    }).select('totalAmount');

    const recentRevenue = recentOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        recentRevenue: recentRevenue.toFixed(2), // Format as currency string
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    next(new ApiError('Failed to fetch dashboard statistics', 500));
  }
};

/**
 * @desc    Get recent activities
 * @route   GET /api/admin/activities
 * @access  Private/Admin
 */
exports.getRecentActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Allow specifying limit via query param

    // Fetch recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2)) // Get roughly half from orders
      .populate('user', 'name email') // Populate user name/email
      .select('user totalAmount status createdAt');

    // Fetch recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2)) // Get roughly half from users
      .select('name email role createdAt');

    // Combine and format activities
    const activities = [
      ...recentOrders.map(order => ({
        type: 'New Order',
        description: `Order placed by ${order.user?.name || 'Unknown User'} for $${order.totalAmount?.toFixed(2)}`,
        status: order.status,
        timestamp: order.createdAt,
        details: { orderId: order._id, userId: order.user?._id }
      })),
      ...recentUsers.map(user => ({
        type: 'New User Registration',
        description: `User ${user.name} (${user.email}) registered as ${user.role}`,
        timestamp: user.createdAt,
        details: { userId: user._id }
      })),
    ];

    // Sort combined activities by timestamp descending and take the top 'limit'
    const sortedActivities = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    res.status(200).json({
      success: true,
      data: sortedActivities,
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    next(new ApiError('Failed to fetch recent activities', 500));
  }
};
