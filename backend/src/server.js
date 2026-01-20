import express from "express";
import path from "path";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express"; // use /server for Vercel
import { ENV } from "./config/env.js";
import { functions, inngest } from "./config/inngest.js";
import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import paymentRoutes from "./routes/payment.route.js";
import cors from "cors";


const app = express();

app.use(
  "/api/payment",
  (req, res, next) => {
    if (req.originalUrl === "/api/payment/webhook") {
      express.raw({ type: "application/json" })(req, res, next);
    } else {
      express.json()(req, res, next); // parse json for non-webhook routes
    }
  },
  paymentRoutes
);
app.use(express.json());

// Clerk auth middleware
app.use(clerkMiddleware()); // adds auth object under req.auth
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Inngest serverless endpoint

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/reviews",reviewRoutes);
app.use("/api/products",productRoutes);
app.use("/api/cart",cartRoutes);


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
