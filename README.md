# Express API Server for Flutter

A simple RESTful API server built with Express.js to serve as a backend for Flutter applications.

## Features

- RESTful API endpoints
- In-memory data storage (can be extended to use a database)
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
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (v6 or higher recommended)
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
PORT=3000
NODE_ENV=development
```

4. Start the server
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

#### Build the Docker image manually:
```
npm run docker-build
```

#### Run a container manually:
```
docker run -p 3000:3000 flutter-api-express
```

## Development

For development with hot reloading:
```
npm run dev
```

For production:
```
npm start
```

## Project Structure

```
/
├── node_modules/
├── src/
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions and classes
│   └── index.js            # Entry point
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```

## Future Improvements

- Add database integration (MongoDB, PostgreSQL, etc.)
- Implement authentication with JWT
- Add input validation
- Add unit and integration tests
- Add API documentation with Swagger
- Add pagination for list endpoints

## API Documentation

API documentation is available at `/api/flutter-docs` endpoint once the server is running.

## Authentication

The API uses JWT for authentication. To access protected routes:

1. Register a new user or login with an existing user
2. Use the returned token in the Authorization header: `Bearer YOUR_TOKEN`

## Example Users

For testing, you can use these credentials:
- Email: `john@example.com`, Password: `password123`
- Email: `jane@example.com`, Password: `password123`
- Email: `flutter@example.com`, Password: `password123`

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

4. Set up environment variables in the Vercel dashboard:
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: Set to `production`
   - `CORS_ORIGIN`: Set to your Flutter app's origin or `*`

5. Your API will be available at the URL provided by Vercel after deployment.