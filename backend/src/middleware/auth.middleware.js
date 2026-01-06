import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { connectDB } from "../config/db.js";
import { ENV } from "../config/env.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      await connectDB(); 

      // ✅ FIX: Call req.auth() as a function
      const { userId: clerkId } = req.auth(); 
      
      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized - no session found" });
      }

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

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized - user not found" });
  }

  // Use .toLowerCase() and .trim() to ensure a perfect match
  const userEmail = req.user.email?.toLowerCase().trim();
  const adminEmail = ENV.ADMIN_EMAIL?.toLowerCase().trim();

  console.log(`Comparing Logged User: [${userEmail}] with Admin: [${adminEmail}]`);

  if (userEmail !== adminEmail) {
    return res.status(403).json({ message: "Forbidden - admin access only" });
  }

  next();
};