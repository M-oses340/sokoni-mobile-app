import express from "express";
import path from "path";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express"; // use /server for Vercel
import { ENV } from "./config/env.js";
import { functions, inngest } from "./config/inngest.js";

const app = express();

app.use(express.json());

// Clerk auth middleware
app.use(clerkMiddleware()); // adds auth object under req.auth

// Inngest serverless endpoint
app.use("/api/inngest", serve({ client: inngest, functions }));

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ message: "API healthy + DB connected" });
  } catch {
    res.status(500).json({ message: "DB connection failed" });
  }
});

// Serve frontend in production
if (ENV.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "../admin/dist")));

  // Catch-all route
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../admin/dist", "index.html"));
  });
}

export default app;
