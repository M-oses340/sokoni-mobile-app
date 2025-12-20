import mongoose from "mongoose";
import { ENV } from "./env.js";

<<<<<<< HEAD
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(ENV.DB_URL, {
      bufferCommands: false
    }).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected");
    return cached.conn;
  } catch (error) {
    console.error("💥 MongoDB connection error:", error);
    throw error; // ❗ do NOT exit the process
  }
};
=======
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.DB_URL);
    console.log(`✅ Connected to MONGODB: ${conn.connection.host}`);
  } catch (error) {
    console.error("💥 MONGODB connection error");
    process.exit(1); // exit code 1 means failure, 0 means success
  }
};
>>>>>>> auth_setup
