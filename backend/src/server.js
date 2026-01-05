import express from "express";
import path from "path";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { ENV } from "./config/env.js";
import { functions, inngest } from "./config/inngest.js";

// Route Imports
import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";

const app = express();

// --- 1. MIDDLEWARE STACK ---

// CORS must be at the very top to handle preflight requests
const allowedOrigins = [
  ENV.CLIENT_URL, // e.g., http://localhost:5173
  "https://sokoni-mobile-app.vercel.app",
  /\.vercel\.app$/ // Allows all Vercel preview deployments
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps/curl) or matched origins
    if (!origin || allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Clerk auth middleware - adds auth object under req.auth
app.use(clerkMiddleware());

// --- 2. API ROUTES ---

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ 
      status: "success", 
      message: "API healthy + DB connected",
      environment: ENV.NODE_ENV 
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "DB connection failed" });
  }
});

// --- 3. PRODUCTION STATIC SERVING ---

if (ENV.NODE_ENV === "production") {
  const __dirname = path.resolve();
  // Ensure this path correctly points to your built admin files
  app.use(express.static(path.join(__dirname, "../admin/dist")));

  // Catch-all route to serve the SPA (React Router)
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../admin/dist", "index.html"));
  });
}

// --- 4. SERVER STARTUP (Local Development Only) ---

const PORT = ENV.PORT || 5000;

const startLocalServer = async () => {
  // Only start the listener if we are not on Vercel/Production
  if (ENV.NODE_ENV !== "production") {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`🚀 Server active at http://localhost:${PORT}`);
        console.log(`🔌 Health check: http://localhost:${PORT}/api/health`);
      });
    } catch (error) {
      console.error("❌ Database connection failed during startup:", error);
    }
  }
};

startLocalServer();

// --- 5. EXPORT FOR VERCEL ---
export default app;