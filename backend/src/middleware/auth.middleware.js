import { getAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { connectDB } from "../config/db.js";
import { ENV } from "../config/env.js";

export const protectRoute = async (req, res, next) => {
  try {
    // 1. Ensure DB is connected
    await connectDB();

    // 2. Get Auth state from Clerk (Does not force redirect)
    const auth = getAuth(req);
    const clerkId = auth.userId;

    // 3. If no clerkId, send JSON 401 instead of redirecting to HTML
    if (!clerkId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: No valid session found." 
      });
    }

    // 4. Check if user exists in our MongoDB
    let user = await User.findOne({ clerkId });

    if (!user) {
      console.log(`User ${clerkId} NOT in Mongo. Syncing from Clerk...`);

      // 5. Use sessionClaims for metadata (populated via Google or PIN login)
      const claims = auth.sessionClaims;
      
      user = await User.create({
        clerkId,
        // Fallback email logic if claims are empty
        email: claims?.email || auth.sessionClaims?.primary_email || `user_${clerkId}@temp.com`,
        name: claims?.full_name || claims?.name || "Sokoni User",
        imageUrl: claims?.image_url || claims?.image || "",
        addresses: [],
        wishlist: [],
        stripeCustomerId: "" 
      });
      
      console.log("Successfully synchronized user to Mongo:", user._id);
    }

    // 6. Attach user to request and move on
    req.user = user;
    next();
  } catch (error) {
    console.error("CRITICAL ERROR in protectRoute:", error.message);
    // Always return JSON for API calls
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized - user not found" });
  }

  const userEmail = req.user.email?.toLowerCase().trim();
  const adminEmail = ENV.ADMIN_EMAIL?.toLowerCase().trim();

  if (userEmail !== adminEmail) {
    return res.status(403).json({ message: "Forbidden - admin access only" });
  }

  next();
};