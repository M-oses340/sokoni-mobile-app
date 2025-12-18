import express from "express";
import { ENV } from "./config/env.js";

const app = express();

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Success" });
});

// Export app for Vercel serverless
export default app;
