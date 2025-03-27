// Temporary in-memory data store
let products = [
  { id: 1, name: 'Smartphone', price: 699.99, category: 'Electronics', inStock: true },
  { id: 2, name: 'Laptop', price: 1299.99, category: 'Electronics', inStock: true },
  { id: 3, name: 'Headphones', price: 149.99, category: 'Audio', inStock: false }
];

// Get all products
exports.getAllProducts = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get a single product by id
exports.getProductById = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = products.find(product => product.id === id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create a new product
exports.createProduct = (req, res) => {
  try {
    const { name, price, category, inStock } = req.body;
    
    // Simple validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name and price'
      });
    }
    
    // Create new product
    const newId = products.length > 0 ? Math.max(...products.map(product => product.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      name,
      price: parseFloat(price),
      category: category || 'Uncategorized',
      inStock: inStock !== undefined ? inStock : true
    };
    
    products.push(newProduct);
    
    res.status(201).json({
      success: true,
      data: newProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update a product
exports.updateProduct = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, price, category, inStock } = req.body;
    
    // Find product
    const productIndex = products.findIndex(product => product.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Update product
    const updatedProduct = {
      ...products[productIndex],
      name: name || products[productIndex].name,
      price: price ? parseFloat(price) : products[productIndex].price,
      category: category || products[productIndex].category,
      inStock: inStock !== undefined ? inStock : products[productIndex].inStock
    };
    
    products[productIndex] = updatedProduct;
    
    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete a product
exports.deleteProduct = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Find product
    const productIndex = products.findIndex(product => product.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Remove product
    products = products.filter(product => product.id !== id);
    
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
