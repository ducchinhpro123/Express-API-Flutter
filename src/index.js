const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const connectDB = require('./lib/db');
const errorHandler = require('./middleware/errorHandler');
const { setupStaticFiles } = require('./utils/setupServer');
const app = express();

// Environment variables with defaults
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Connect to MongoDB
connectDB();

// Enhanced CORS configuration for Flutter
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  abortOnLimit: true,
  useTempFiles: false,
  createParentPath: true
}));

// Set up static file serving
app.use('/public', express.static(path.join(__dirname, '../public')));

// Only use morgan in development environment
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Import routes
const apiRoutes = require('./routes');

// Use routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Flutter E-Commerce API Server',
    status: 'API is running',
    documentation: '/api/flutter-docs'
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist'
  });
});

// Use custom error handler middleware
app.use(errorHandler);

// For non-Vercel environments, start the server
if (process.env.VERCEL !== '1') {
  (async () => {
    try {
      // Download product images before starting the server
      await setupStaticFiles(app);
      
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);
        console.log(`API documentation: http://localhost:${PORT}/api/flutter-docs`);
        console.log(`Product images: http://localhost:${PORT}/public/images`);
      });
    } catch (error) {
      console.error('Error starting server:', error);
    }
  })();
} else {
  // For Vercel, export the app
  module.exports = app;
}
