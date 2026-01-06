import mongoose from "mongoose";
import { ENV } from "./env.js";

// This variable persists across function executions in Vercel
let isConnected = false;

export const connectDB = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    return; // Already connected, skip
  }

  try {
    const db = await mongoose.connect(ENV.DB_URL);
    isConnected = db.connections[0].readyState;
    console.log(`✅ Connected to MONGODB: ${db.connection.host}`);
  } catch (error) {
    console.error("💥 MONGODB connection error:", error.message);
    // DO NOT process.exit(1) here. 
    // Throwing the error allows your middleware to catch it and return a 500
    throw error; 
  }
};