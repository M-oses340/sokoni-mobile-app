import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { connectDB } from "../config/db.js";
import { ENV } from "../config/env.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      await connectDB(); 

      // 1. Get auth data from Clerk
      const auth = req.auth(); 
      const clerkId = auth.userId;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized - no session found" });
      }

      // 2. Try to find the user in Mongo
      let user = await User.findOne({ clerkId });

      // 3. 🚀 AUTO-SYNC: If user is in Clerk but NOT in Mongo, create them!
      if (!user) {
        console.log("User found in Clerk but missing in Mongo. Creating user record...");
        
        // Fetch full user details from Clerk if not in session claims
        // Or use sessionClaims if you have configured them in the Clerk Dashboard
        const clerkUser = await auth.getUser(); 

        user = await User.create({
          clerkId: clerkId,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Sokoni User",
          imageUrl: clerkUser.imageUrl,
        });
      }

      // 4. Attach the Mongo user object to the request
      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware:", error);
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