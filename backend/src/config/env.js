// backend/src/config/env.js
import dotenv from "dotenv";

// Only run dotenv in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  // Ensure we fallback to process.env directly if ENV object fails
  DB_URL: process.env.DB_URL || process.env.MONGO_URI, 
  CLIENT_URL: process.env.CLIENT_URL,
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  // ... other vars
};