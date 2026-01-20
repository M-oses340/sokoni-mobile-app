import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { connectDB } from "../config/db.js";
import { ENV } from "../config/env.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      await connectDB(); 

      // 1. Get the Clerk ID
      const { userId: clerkId } = req.auth(); 
      console.log("Checking MongoDB for ClerkID:", clerkId);

      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized - No Clerk ID found" });
      }

      // 2. Look for the user
      let user = await User.findOne({ clerkId });

      // 3. If not found, create them using Clerk's Request data
      if (!user) {
        console.log("User NOT in Mongo. Attempting to create...");

        // Note: You may need to install @clerk/clerk-sdk-node 
        // or ensure your Clerk settings pass email in 'sessionClaims'
        const session = req.auth();
        
        user = await User.create({
          clerkId: clerkId,
          // Fallback values if Clerk doesn't provide them in the header
          email: session.sessionClaims?.email || `user_${clerkId}@temporary.com`,
          name: session.sessionClaims?.name || "Sokoni User",
        });
        
        console.log("Successfully created user in Mongo:", user._id);
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("CRITICAL ERROR in protectRoute:", error.message);
      res.status(500).json({ message: "Internal server error during user sync" });
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