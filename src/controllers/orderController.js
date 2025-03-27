const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

// Get all orders
exports.getAllOrders = async (req, res, next) => {
  try {
    let query;
    
    // If user is not admin, only show their orders
    if (req.user.role !== 'admin') {
      query = Order.find({ user: req.user._id });
    } else {
      query = Order.find();
    }
    
    // Populate with user and product data
    query = query.populate({
      path: 'user',
      select: 'name email'
    }).populate({
      path: 'products.product',
      select: 'name price'
    });
    
    const orders = await query;
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Get a single order by id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'products.product',
        select: 'name price'
      });
    
    if (!order) {
      return next(new ApiError('Order not found', 404));
    }
    
    // Check if user is authorized to view this order
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return next(new ApiError('Not authorized to access this order', 403));
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Create a new order
exports.createOrder = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    
    // Validate products and calculate total amount
    if (!req.body.products || req.body.products.length === 0) {
      return next(new ApiError('Please add at least one product to the order', 400));
    }
    
    let totalAmount = 0;
    
    // Process each product in the order
    for (let i = 0; i < req.body.products.length; i++) {
      const item = req.body.products[i];
      
      // Check if product exists
      const product = await Product.findById(item.product);
      
      if (!product) {
        return next(new ApiError(`Product with ID ${item.product} not found`, 404));
      }
      
      // Check if quantity is valid
      if (!item.quantity || item.quantity < 1) {
        return next(new ApiError('Quantity must be at least 1', 400));
      }
      
      // Check if product is in stock
      if (!product.inStock) {
        return next(new ApiError(`Product ${product.name} is out of stock`, 400));
      }
      
      // Check if enough quantity is available
      if (product.quantity < item.quantity) {
        return next(new ApiError(`Only ${product.quantity} items of ${product.name} are available`, 400));
      }
      
      // Add product price to item
      item.price = product.price;
      
      // Add to total amount
      totalAmount += product.price * item.quantity;
      
      // Update product quantity
      product.quantity -= item.quantity;
      if (product.quantity === 0) {
        product.inStock = false;
      }
      
      await product.save();
    }
    
    // Set total amount
    req.body.totalAmount = totalAmount;
    
    // Create order
    const order = await Order.create(req.body);
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return next(new ApiError('Order not found', 404));
    }
    
    // Only admin can update order status
    if (req.user.role !== 'admin') {
      return next(new ApiError('Not authorized to update order status', 403));
    }
    
    // Update order
    order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, paymentStatus: req.body.paymentStatus },
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return next(new ApiError('Order not found', 404));
    }
    
    // Check if user is authorized to cancel this order
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return next(new ApiError('Not authorized to cancel this order', 403));
    }
    
    // Check if order can be canceled
    if (['shipped', 'delivered'].includes(order.status)) {
      return next(new ApiError(`Order cannot be canceled when status is ${order.status}`, 400));
    }
    
    // Restore product quantities
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      
      if (product) {
        product.quantity += item.quantity;
        product.inStock = true;
        await product.save();
      }
    }
    
    // Update order status
    order.status = 'canceled';
    await order.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};
