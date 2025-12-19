import express from "express";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";

const app = express();

app.use(clerkMiddleware()); // adds auth object under the req => req.auth

app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ message: "API healthy + DB connected" });
  } catch {
    res.status(500).json({ message: "DB connection failed" });
  }
});

export default app;
