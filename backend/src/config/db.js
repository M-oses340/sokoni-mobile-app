import mongoose from "mongoose";
import { ENV } from "./env.js";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return; // Reuse existing connection

  try {
    const db = await mongoose.connect(ENV.DB_URL, {
      serverSelectionTimeoutMS: 5000, // Fail fast if DB is down
    });
    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("💥 MongoDB connection error:", error.message);
    // Throw error so the middleware can catch it and return a 500
    throw error; 
  }
};