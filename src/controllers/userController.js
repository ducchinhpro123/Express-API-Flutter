const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

// JWT secret key (should be in .env file in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Initialize with sample users for Flutter testing
let users = [
  { 
    id: 1, 
    name: 'John Doe', 
    email: 'john@example.com', 
    role: 'user', 
    password: '$2b$10$6s3BiF5YBGNVnc1zpGZfiOJuCw9bqJ.GQ1xQHaBmR0rmMnNX.Ee8e' // password: 'password123'
  },
  { 
    id: 2, 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    role: 'admin', 
    password: '$2b$10$6s3BiF5YBGNVnc1zpGZfiOJuCw9bqJ.GQ1xQHaBmR0rmMnNX.Ee8e' // password: 'password123'
  },
  { 
    id: 3, 
    name: 'Flutter Dev', 
    email: 'flutter@example.com', 
    role: 'developer', 
    password: '$2b$10$6s3BiF5YBGNVnc1zpGZfiOJuCw9bqJ.GQ1xQHaBmR0rmMnNX.Ee8e' // password: 'password123'
  }
];

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Simple validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password'
      });
    }
    
    // Check if email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
    const newUser = {
      id: newId,
      name,
      email,
      password: hashedPassword,
      role: 'user'
    };
    
    users.push(newUser);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Don't return password
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      token,
      data: userWithoutPassword
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// User login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Simple validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    // Find user by email
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Don't return password
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      token,
      data: userWithoutPassword
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Get all users
exports.getAllUsers = (req, res) => {
  try {
    // Don't send back passwords
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: usersWithoutPasswords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get a single user by id
exports.getUserById = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = users.find(user => user.id === id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Don't send back password
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create a new user
exports.createUser = (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    // Simple validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name and email'
      });
    }
    
    // Create new user
    const newId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
    const newUser = {
      id: newId,
      name,
      email,
      role: role || 'user'
    };
    
    users.push(newUser);
    
    res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update a user
exports.updateUser = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, role } = req.body;
    
    // Find user
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update user
    const updatedUser = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      role: role || users[userIndex].role
    };
    
    users[userIndex] = updatedUser;
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete a user
exports.deleteUser = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Find user
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Remove user
    users = users.filter(user => user.id !== id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
