import mongoose from "mongoose";
import { ENV } from "./env.js";

// Global cache to prevent multiple connections in Vercel
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // 👈 CRITICAL: Stops the 10s "Buffering" hang
      serverSelectionTimeoutMS: 5000, 
    };

    cached.promise = mongoose.connect(ENV.DB_URL, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB Connected");
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};