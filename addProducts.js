require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/lib/db');
const Product = require('./src/models/Product');

// More detailed mock products to make the app look realistic
const additionalProducts = [
  // Electronics category
  {
    name: 'Ultra HD Smart TV 55"',
    description: 'Crystal clear 4K display with smart features, streaming apps, and voice control. Experience movies and shows like never before with vibrant colors and deep blacks.',
    price: 799.99,
    category: 'electronics',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=2000',
    quantity: 15,
    rating: 4.6,
    featured: true,
    discount: 10,
    attributes: {
      brand: 'TechVision',
      resolution: '4K Ultra HD',
      screenSize: '55 inches',
      refreshRate: '120Hz',
      connectivity: 'HDMI, USB, Bluetooth, WiFi'
    }
  },
  {
    name: 'Professional DSLR Camera',
    description: 'Capture stunning photos and videos with this professional-grade camera. Perfect for photography enthusiasts and professionals alike.',
    price: 1299.99,
    category: 'electronics',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1764',
    quantity: 8,
    rating: 4.9,
    featured: true,
    discount: 0,
    attributes: {
      brand: 'PhotoPro',
      megapixels: '24.2MP',
      sensorType: 'Full-frame CMOS',
      videoResolution: '4K',
      batteryLife: '1200 shots'
    }
  },
  {
    name: 'Wireless Gaming Mouse',
    description: 'High-precision gaming mouse with customizable RGB lighting and programmable buttons. Ultra-responsive with zero lag.',
    price: 79.99,
    category: 'electronics',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1965',
    quantity: 50,
    rating: 4.7,
    featured: false,
    discount: 5,
    attributes: {
      brand: 'GameMaster',
      dpi: '16000',
      buttons: '8 programmable',
      connectivity: 'Wireless 2.4GHz',
      batteryLife: '70 hours'
    }
  },
  {
    name: 'Smart Watch Series 5',
    description: 'Track your fitness, receive notifications, and more with this advanced smartwatch. Water-resistant with heart rate monitoring.',
    price: 299.99,
    category: 'electronics',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1964',
    quantity: 30,
    rating: 4.5,
    featured: true,
    discount: 0,
    attributes: {
      brand: 'FitTech',
      displaySize: '1.4 inches',
      batteryLife: '5 days',
      waterResistant: 'Yes, 50m',
      sensors: 'Heart rate, GPS, Accelerometer'
    }
  },
  {
    name: 'Bluetooth Earbuds',
    description: 'Truly wireless earbuds with noise cancellation and crystal clear sound. Compact charging case provides multiple charges on the go.',
    price: 149.99,
    category: 'electronics',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1933',
    quantity: 45,
    rating: 4.3,
    featured: false,
    discount: 15,
    attributes: {
      brand: 'SoundPods',
      batteryLife: '6 hours (24 with case)',
      noiseReduction: 'Active noise cancellation',
      waterResistant: 'IPX5',
      connectivity: 'Bluetooth 5.2'
    }
  },
  
  // Clothing category
  {
    name: 'Premium Leather Jacket',
    description: 'Genuine leather jacket with a modern design. Durable, stylish, and perfect for casual outings.',
    price: 199.99,
    category: 'clothing',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1935',
    quantity: 12,
    rating: 4.8,
    featured: true,
    discount: 0,
    attributes: {
      material: 'Genuine leather',
      sizes: 'S, M, L, XL',
      colors: 'Black, Brown',
      style: 'Casual',
      care: 'Professional leather cleaning'
    }
  },
  {
    name: 'Slim Fit Jeans',
    description: 'Comfortable slim fit jeans made from premium denim. Versatile style that pairs well with any outfit.',
    price: 59.99,
    category: 'clothing',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1974',
    quantity: 40,
    rating: 4.4,
    featured: false,
    discount: 10,
    attributes: {
      material: '98% Cotton, 2% Elastane',
      sizes: '28-38',
      colors: 'Blue, Black, Grey',
      fit: 'Slim',
      rise: 'Mid-rise'
    }
  },
  {
    name: 'Summer Floral Dress',
    description: 'Light and breezy floral dress perfect for summer days. Features a flattering cut and breathable fabric.',
    price: 49.99,
    category: 'clothing',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=1740',
    quantity: 25,
    rating: 4.6,
    featured: true,
    discount: 5,
    attributes: {
      material: '100% Cotton',
      sizes: 'XS, S, M, L, XL',
      pattern: 'Floral',
      length: 'Midi',
      care: 'Machine washable'
    }
  },
  
  // Home category
  {
    name: 'Stainless Steel Kitchen Set',
    description: 'Complete set of premium stainless steel cookware. Includes pots, pans, and utensils for all your cooking needs.',
    price: 249.99,
    category: 'home',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1556909114-44e3e9e10c33?q=80&w=1740',
    quantity: 10,
    rating: 4.7,
    featured: true,
    discount: 5,
    attributes: {
      material: 'Stainless Steel',
      pieces: '15-piece set',
      dishwasherSafe: 'Yes',
      inductionCompatible: 'Yes',
      warranty: '10 years'
    }
  },
  {
    name: 'Modern Desk Lamp',
    description: 'Adjustable LED desk lamp with multiple brightness settings and color temperatures. Energy-efficient and sleek design.',
    price: 39.99,
    category: 'home',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1534189256798-f24d39c2bff8?q=80&w=1927',
    quantity: 35,
    rating: 4.5,
    featured: false,
    discount: 0,
    attributes: {
      type: 'LED',
      colorTemperatures: '3000K-6000K',
      brightness: '5 levels',
      powerSource: 'USB/AC Adapter',
      adjustable: 'Flexible arm'
    }
  },
  {
    name: 'Luxury Bed Sheet Set',
    description: 'Premium cotton bed sheets with high thread count for exceptional comfort and durability. Includes fitted sheet, flat sheet, and pillowcases.',
    price: 89.99,
    category: 'home',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1629380108632-2863aefda4c5?q=80&w=1740',
    quantity: 20,
    rating: 4.8,
    featured: true,
    discount: 10,
    attributes: {
      material: 'Egyptian Cotton',
      threadCount: '800',
      sizes: 'Twin, Full, Queen, King',
      colors: 'White, Grey, Blue, Beige',
      pieces: '4-piece set'
    }
  },
  
  // Beauty category
  {
    name: 'Luxury Skincare Set',
    description: 'Complete skincare routine with cleanser, toner, serum, and moisturizer. Made with natural ingredients for all skin types.',
    price: 129.99,
    category: 'beauty',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1740',
    quantity: 15,
    rating: 4.9,
    featured: true,
    discount: 0,
    attributes: {
      skinType: 'All types',
      ingredients: 'Natural and organic',
      pieces: '4-piece set',
      fragranceFree: 'Yes',
      crueltyFree: 'Yes'
    }
  },
  {
    name: 'Professional Hair Dryer',
    description: 'Salon-quality hair dryer with multiple heat and speed settings. Includes concentrator and diffuser attachments.',
    price: 79.99,
    category: 'beauty',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1522338140552-f46d3afef5e5?q=80&w=1746',
    quantity: 18,
    rating: 4.6,
    featured: false,
    discount: 5,
    attributes: {
      wattage: '1875W',
      technology: 'Ionic',
      settings: '3 heat, 2 speed',
      attachments: 'Concentrator, Diffuser',
      cableLength: '9 feet'
    }
  },
  
  // Sports category
  {
    name: 'Premium Yoga Mat',
    description: 'Eco-friendly, non-slip yoga mat with optimal thickness for comfort and stability. Perfect for yoga, pilates, and other floor exercises.',
    price: 49.99,
    category: 'sports',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1599447292411-1195604536c2?q=80&w=1740',
    quantity: 30,
    rating: 4.7,
    featured: false,
    discount: 0,
    attributes: {
      material: 'TPE Eco-friendly',
      thickness: '6mm',
      dimensions: '72" x 24"',
      nonSlip: 'Double-sided texture',
      weight: '2.5 lbs'
    }
  },
  {
    name: 'Mountain Bike',
    description: 'All-terrain mountain bike with premium suspension and durable frame. Perfect for trails and outdoor adventures.',
    price: 599.99,
    category: 'sports',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1740',
    quantity: 7,
    rating: 4.8,
    featured: true,
    discount: 8,
    attributes: {
      frameSize: '17", 19", 21"',
      wheels: '27.5"',
      speeds: '21-speed',
      brakes: 'Hydraulic disc',
      suspension: 'Front and rear'
    }
  },
  
  // Books category (mapped to 'other' in the backend)
  {
    name: 'Bestselling Novel',
    description: 'Award-winning fiction novel that has captivated readers worldwide. A story of adventure, love, and self-discovery.',
    price: 19.99,
    category: 'other', // 'books' maps to 'other'
    inStock: true,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1734',
    quantity: 50,
    rating: 4.9,
    featured: true,
    discount: 0,
    attributes: {
      author: 'Jane Writer',
      pages: '384',
      language: 'English',
      format: 'Hardcover',
      genre: 'Fiction'
    }
  },
  {
    name: 'Programming Guide',
    description: 'Comprehensive guide to modern programming techniques and best practices. Perfect for beginners and experienced developers alike.',
    price: 29.99,
    category: 'other', // 'books' maps to 'other'
    inStock: true,
    image: 'https://images.unsplash.com/photo-1623479322729-28b25c16b011?q=80&w=1740',
    quantity: 25,
    rating: 4.7,
    featured: false,
    discount: 5,
    attributes: {
      author: 'Tech Expert',
      pages: '500',
      language: 'English',
      format: 'Paperback',
      level: 'Beginner to Advanced'
    }
  }
];

// Function to add products
const addProducts = async () => {
  let connection;
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    connection = await connectDB();
    console.log('Connected to MongoDB successfully');
    
    console.log(`Adding ${additionalProducts.length} new products...`);
    
    // Insert all products
    const result = await Product.insertMany(additionalProducts);
    
    console.log(`Successfully added ${result.length} new products to the database`);
    
  } catch (error) {
    console.error(`Error adding products: ${error.message}`);
    
    if (error.name === 'ValidationError') {
      Object.keys(error.errors).forEach(key => {
        console.error(`Validation error for field ${key}: ${error.errors[key].message}`);
      });
    }
    
  } finally {
    // Close the connection
    if (connection) {
      try {
        console.log('Closing MongoDB connection...');
        await mongoose.disconnect();
        console.log('MongoDB connection closed');
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
      }
    }
    
    // Exit the process
    process.exit(0);
  }
};

// Run the function
addProducts(); 