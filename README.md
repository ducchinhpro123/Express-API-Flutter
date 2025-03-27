# Express API Server for Flutter E-Commerce

A RESTful API server built with Express.js to serve as a backend for Flutter e-commerce applications.

## Features

- RESTful API endpoints
- MongoDB integration
- User authentication with JWT
- Product management with images
- Order management system
- Error handling middleware
- CORS support
- Logging with Morgan

## API Endpoints

### Base URL

```
http://localhost:3000/api
```

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user by ID
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get a specific order by ID
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/cancel` - Cancel an order

### Images

- `GET /api/images` - Get all product images
- `GET /api/images/:filename` - Get a specific image

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (v6 or higher recommended)
- MongoDB (local or Atlas)
- Docker (optional)

### Installation

1. Clone the repository
```
git clone <repository-url>
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file based on the example
```
cp .env.example .env
```

4. Set up product images
```
npm run setup-images
```

5. Seed the database with initial data
```
npm run seed
```

6. Start the server
```
npm run dev
```

The server will start on port 3000 (or the port specified in your .env file).

### Docker Setup

You can also run this application using Docker:

#### Build and run with docker-compose:
```
npm run docker-start
```

#### Stop the containers:
```
npm run docker-stop
```

## Project Structure

```
/
├── node_modules/
├── public/
│   └── images/          # Product images
├── src/
│   ├── controllers/     # Request handlers
│   ├── lib/             # Database connection
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── index.js         # Entry point
├── .dockerignore
├── .env                 # Environment variables
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

## API Documentation

API documentation is available at `/api/flutter-docs` endpoint once the server is running.

## Authentication

The API uses JWT for authentication. To access protected routes:

1. Register a new user or login with an existing user
2. Use the returned token in the Authorization header: `Bearer YOUR_TOKEN`

## Images

Product images are stored in the `public/images` directory and served at `/public/images/:filename`. The image downloader script fetches placeholder images from Unsplash for demo products.

## Example Users

For testing, you can use these credentials:
- Email: `john@example.com`, Password: `password123` (Role: user)
- Email: `jane@example.com`, Password: `password123` (Role: admin)
- Email: `flutter@example.com`, Password: `password123` (Role: developer)

## Deployment

### Vercel Deployment

This API can be deployed to Vercel using the following steps:

1. Install the Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy to Vercel:
```bash
npm run deploy
```

4. Set up environment variables in the Vercel dashboard.