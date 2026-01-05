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
import cors from "cors";


const app = express();
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

app.use(express.json());

// Clerk auth middleware
app.use(clerkMiddleware()); // adds auth object under req.auth


// Inngest serverless endpoint

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/order",orderRoutes);
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

// At the very bottom of your server.js

const PORT = ENV.PORT || 5000;

// This function starts the server only if we are running locally
const startLocalServer = async () => {
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

export default app;