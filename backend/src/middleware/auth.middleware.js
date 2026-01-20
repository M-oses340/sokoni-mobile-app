import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { connectDB } from "../config/db.js";
import { ENV } from "../config/env.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      await connectDB(); 

      const auth = req.auth();
      const clerkId = auth.userId;
      
      if (!clerkId) return res.status(401).json({ message: "No Clerk ID found" });

      let user = await User.findOne({ clerkId });

      if (!user) {
        console.log("User NOT in Mongo. Initializing user and services...");

        // Fix: Use 'claims' consistently
        const claims = auth.sessionClaims; 
        
        user = await User.create({
          clerkId,
          email: claims?.email || `user_${clerkId}@temporary.com`,
          name: claims?.name || "Sokoni User",
          imageUrl: claims?.image || "",
          addresses: [], // Prevents map() crashes
          wishlist: [],
          stripeCustomerId: "" // We will update this when they first visit checkout
        });
        
        console.log("Successfully created user in Mongo:", user._id);
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("CRITICAL ERROR in protectRoute:", error.message);
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