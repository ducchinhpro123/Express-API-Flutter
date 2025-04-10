const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const imageRoutes = require('./imageRoutes');
const cartRoutes = require('./cartRoutes'); // Import cart routes
const adminRoutes = require('./adminRoutes');

// Use route modules
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes); // Mount cart routes
router.use('/images', imageRoutes);
router.use('/admin', adminRoutes);

// Flutter-specific documentation endpoint
router.get('/flutter-docs', (req, res) => {
  res.json({
    message: 'API Documentation for Flutter E-Commerce App',
    version: '1.0.0',
    authEndpoints: {
      register: {
        url: '/api/users/register',
        method: 'POST',
        body: {
          name: 'String (required)',
          email: 'String (required)',
          password: 'String (required)'
        },
        response: {
          success: 'Boolean',
          token: 'JWT token string',
          data: 'User object (without password)'
        }
      },
      login: {
        url: '/api/users/login',
        method: 'POST',
        body: {
          email: 'String (required)',
          password: 'String (required)'
        },
        response: {
          success: 'Boolean',
          token: 'JWT token string',
          data: 'User object (without password)'
        }
      }
    },
    userEndpoints: {
      getAllUsers: {
        url: '/api/users',
        method: 'GET',
        auth: 'Bearer token required'
      },
      getUserById: {
        url: '/api/users/:id',
        method: 'GET',
        auth: 'Bearer token required'
      }
    },
    productEndpoints: {
      getAllProducts: {
        url: '/api/products',
        method: 'GET',
        queryParams: {
          category: 'Filter by category',
          inStock: 'Filter by stock status (true/false)',
          'price[gt]': 'Greater than price',
          'price[lt]': 'Less than price',
          sort: 'Sort field (e.g., sort=price or sort=-price for descending)',
          select: 'Select fields (e.g., select=name,price)',
          page: 'Page number for pagination',
          limit: 'Number of items per page'
        }
      },
      getProductById: {
        url: '/api/products/:id',
        method: 'GET'
      },
      getProductsByCategory: {
        url: '/api/products/category/:category',
        method: 'GET',
        description: 'Get all products in a specific category'
      },
      createProduct: {
        url: '/api/products',
        method: 'POST',
        auth: 'Bearer token required (admin only)',
        body: {
          name: 'String (required)',
          description: 'String (required)',
          price: 'Number (required)',
          category: 'String (required)',
          inStock: 'Boolean',
          image: 'String',
          quantity: 'Number',
          featured: 'Boolean',
          discount: 'Number',
          attributes: 'Object'
        }
      },
      updateProduct: {
        url: '/api/products/:id',
        method: 'PUT',
        auth: 'Bearer token required (admin only)',
        body: {
          name: 'String',
          description: 'String',
          price: 'Number',
          category: 'String',
          inStock: 'Boolean',
          image: 'String',
          quantity: 'Number',
          featured: 'Boolean',
          discount: 'Number',
          attributes: 'Object'
        }
      },
      deleteProduct: {
        url: '/api/products/:id',
        method: 'DELETE',
        auth: 'Bearer token required (admin only)'
      }
    },
    orderEndpoints: {
      getAllOrders: {
        url: '/api/orders',
        method: 'GET',
        auth: 'Bearer token required'
      },
      getOrderById: {
        url: '/api/orders/:id',
        method: 'GET',
        auth: 'Bearer token required'
      },
      createOrder: {
        url: '/api/orders',
        method: 'POST',
        auth: 'Bearer token required',
        body: {
          products: 'Array of { product: (product ID), quantity: Number }',
          shippingAddress: 'Object with street, city, state, zipCode, country',
          paymentMethod: 'String (credit_card, paypal, cash_on_delivery)'
        }
      },
      updateOrderStatus: {
        url: '/api/orders/:id/status',
        method: 'PUT',
        auth: 'Bearer token required (admin only)',
        body: {
          status: 'String (pending, processing, shipped, delivered, canceled)',
          paymentStatus: 'String (pending, completed, failed, refunded)'
        }
      },
      cancelOrder: {
        url: '/api/orders/:id/cancel',
        method: 'PUT',
        auth: 'Bearer token required'
      }
    },
    imageEndpoints: {
      getAllImages: {
        url: '/api/images',
        method: 'GET',
        description: 'Get a list of all product images'
      },
      getImageByFilename: {
        url: '/api/images/:filename',
        method: 'GET',
        description: 'Get a specific image by filename'
      },
      uploadImage: {
        url: '/api/images/upload',
        method: 'POST',
        auth: 'Bearer token required (admin only)',
        contentType: 'multipart/form-data',
        body: {
          image: 'File (required, max 5MB, JPEG/PNG/WEBP)'
        },
        response: {
          success: 'Boolean',
          data: {
            filename: 'String',
            filepath: 'String',
            url: 'String'
          }
        }
      },
      deleteImage: {
        url: '/api/images/:filename',
        method: 'DELETE',
        auth: 'Bearer token required (admin only)'
      }
    },
    adminEndpoints: {
      dashboard: {
        url: '/api/admin/dashboard',
        method: 'GET',
        auth: 'Bearer token required (admin only)'
      },
      activities: {
        url: '/api/admin/activities',
        method: 'GET',
        auth: 'Bearer token required (admin only)'
      }
    },
    exampleCredentials: [
      { email: 'john@example.com', password: 'password123' },
      { email: 'jane@example.com', password: 'password123' },
      { email: 'flutter@example.com', password: 'password123' }
    ]
  });
});

// Base API route
router.get('/', (req, res) => {
  res.json({
    message: 'E-Commerce API is working',
    endpoints: [
      '/api/users',
      '/api/users/register',
      '/api/users/login',
      '/api/products',
      '/api/orders',
      '/api/images',
      '/api/admin/dashboard',
      '/api/admin/activities',
      '/api/flutter-docs'
    ]
  });
});

module.exports = router;
