import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { ENV } from "../config/env.js";

const products = [
  {
    name: "Wireless Bluetooth Headphones",
    description:
      "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and travelers.",
    price: 149.99,
    stock: 50,
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500",
    ],
    averageRating: 4.5,
    totalReviews: 128,
  },
  {
    name: "Smart Watch Series 5",
    description:
      "Advanced fitness tracking, heart rate monitor, GPS, and water-resistant design. Stay connected with notifications and apps on your wrist.",
    price: 299.99,
    stock: 35,
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500",
    ],
    averageRating: 4.7,
    totalReviews: 256,
  },
  {
    name: "Leather Crossbody Bag",
    description:
      "Handcrafted genuine leather bag with adjustable strap. Features multiple compartments and elegant design perfect for daily use.",
    price: 89.99,
    stock: 25,
    category: "Fashion",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500",
    ],
    averageRating: 4.3,
    totalReviews: 89,
  },
  {
    name: "Running Shoes - Pro Edition",
    description:
      "Lightweight running shoes with responsive cushioning and breathable mesh upper. Designed for performance and comfort during long runs.",
    price: 129.99,
    stock: 60,
    category: "Sports",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
    ],
    averageRating: 4.6,
    totalReviews: 342,
  },
  {
    name: "Bestselling Mystery Novel",
    description:
      "A gripping psychological thriller that will keep you on the edge of your seat. New York Times bestseller with over 1 million copies sold.",
    price: 24.99,
    stock: 100,
    category: "Books",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500",
    ],
    averageRating: 4.8,
    totalReviews: 1243,
  },
  {
    name: "Portable Bluetooth Speaker",
    description:
      "Waterproof wireless speaker with 360-degree sound, 12-hour battery life, and durable design. Perfect for outdoor adventures.",
    price: 79.99,
    stock: 45,
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
      "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500",
    ],
    averageRating: 4.4,
    totalReviews: 167,
  },
  {
    name: "Classic Denim Jacket",
    description:
      "Timeless denim jacket with vintage wash and comfortable fit. A wardrobe essential that pairs perfectly with any outfit.",
    price: 69.99,
    stock: 40,
    category: "Fashion",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500",
    ],
    averageRating: 4.2,
    totalReviews: 95,
  },
  {
    name: "Yoga Mat Pro",
    description:
      "Extra-thick non-slip yoga mat with carrying strap. Eco-friendly material provides excellent cushioning and grip for all yoga styles.",
    price: 49.99,
    stock: 75,
    category: "Sports",
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
      "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500",
    ],
    averageRating: 4.5,
    totalReviews: 203,
  },
  {
    name: "Mechanical Keyboard RGB",
    description:
      "Gaming keyboard with customizable RGB lighting, mechanical switches, and programmable keys. Built for gamers and typing enthusiasts.",
    price: 119.99,
    stock: 30,
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
    ],
    averageRating: 4.7,
    totalReviews: 421,
  },
  {
    name: "Coffee Table Book Collection",
    description:
      "Stunning photography book featuring architecture and design from around the world. Hardcover edition with 300+ pages of inspiration.",
    price: 39.99,
    stock: 55,
    category: "Books",
    images: [
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500",
    ],
    averageRating: 4.6,
    totalReviews: 134,
  },
  
  // ELECTRONICS
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise canceling with two processors controlling 8 microphones. Magnificent Sound, engineered to perfection with the new Integrated Processor V1.",
    price: 348.00,
    stock: 25,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
    averageRating: 4.9,
    totalReviews: 850,
  },
  {
    name: "MacBook Pro 14 M3",
    description: "The most advanced chips ever built for a personal computer. Up to 18 hours of battery life and the best laptop display in the world.",
    price: 1599.00,
    stock: 15,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1517336714460-45b25959c94b?w=800"],
    averageRating: 4.8,
    totalReviews: 120,
  },
  // FASHION
  {
    name: "Urban Explorer Backpack",
    description: "Water-resistant, recycled polyester fabric. Includes a padded 15-inch laptop sleeve and hidden security pockets for travel.",
    price: 85.00,
    stock: 40,
    category: "Fashion",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"],
    averageRating: 4.4,
    totalReviews: 210,
  },
  {
    name: "Minimalist Leather Sneakers",
    description: "Hand-stitched Italian leather. Versatile design that transitions perfectly from office wear to weekend outings.",
    price: 120.00,
    stock: 30,
    category: "Fashion",
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800"],
    averageRating: 4.6,
    totalReviews: 95,
  },
  // HOME & KITCHEN
  {
    name: "Barista Express Espresso Machine",
    description: "Create third wave specialty coffee at home. Integrated grinder goes from beans to espresso in under a minute.",
    price: 699.95,
    stock: 10,
    category: "Home & Garden",
    images: ["https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=800"],
    averageRating: 4.7,
    totalReviews: 340,
  },
  {
    name: "Smart Ceramic Table Lamp",
    description: "Adjustable color temperature and brightness via app. Minimalist ceramic base with a linen shade.",
    price: 45.00,
    stock: 100,
    category: "Home & Garden",
    images: ["https://images.unsplash.com/photo-1507473884658-c70b65593538?w=800"],
    averageRating: 4.2,
    totalReviews: 55,
  },
  // SPORTS
  {
    name: "Durable Mountain Bike",
    description: "Aluminum frame with 21-speed drivetrain and mechanical disc brakes for all-terrain performance.",
    price: 450.00,
    stock: 8,
    category: "Sports",
    images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800"],
    averageRating: 4.5,
    totalReviews: 88,
  }

];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(ENV.DB_URL);
    console.log("✅ Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing products");

    // Insert seed products
    await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${products.length} products`);

    // Display summary
    const categories = [...new Set(products.map((p) => p.category))];
    console.log("\n📊 Seeded Products Summary:");
    console.log(`Total Products: ${products.length}`);
    console.log(`Categories: ${categories.join(", ")}`);

    // Close connection
    await mongoose.connection.close();
    console.log("\n✅ Database seeding completed and connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();