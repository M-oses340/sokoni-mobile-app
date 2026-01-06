import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { ENV } from "../config/env.js";
import { connectDB } from "../config/db.js"; // Import your connection function

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      // 1. CRITICAL: Wait for the database connection first
      await connectDB(); 

      const clerkId = req.auth.userId; // Removed () as Clerk usually provides this as a property
      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      // 2. Now this query won't "buffer" and timeout
      const user = await User.findOne({ clerkId });
      
      if (!user) return res.status(404).json({ message: "User not found" });

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];