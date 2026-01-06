import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { connectDB } from "../config/db.js";
import { ENV } from "../config/env.js"; // Needed for admin email check

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      await connectDB(); 

      const clerkId = req.auth.userId; 
      if (!clerkId) return res.status(401).json({ message: "Unauthorized" });

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

// ADD THIS EXPORT TO FIX THE SYNTAX ERROR
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized - user not found" });
  }

  if (req.user.email !== ENV.ADMIN_EMAIL) {
    return res.status(403).json({ message: "Forbidden - admin access only" });
  }

  next();
};