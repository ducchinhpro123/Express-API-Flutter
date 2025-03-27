const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');

// Use route modules
router.use('/users', userRoutes);
router.use('/products', productRoutes);

// Flutter-specific documentation endpoint
router.get('/flutter-docs', (req, res) => {
  res.json({
    message: 'API Documentation for Flutter Developers',
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
    message: 'API is working',
    endpoints: [
      '/api/users',
      '/api/users/register',
      '/api/users/login',
      '/api/products',
      '/api/flutter-docs'
    ]
  });
});

module.exports = router;