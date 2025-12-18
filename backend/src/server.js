import express from "express";
import path from "path";
import { ENV } from "./config/env.js";

const app = express();
const __dirname = path.resolve();

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Success" });
});

// Serve frontend in production
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../admin/dist")));

  // Express 5 catch-all
  app.get(/.*/, (req, res) => {
    res.sendFile(
      path.join(__dirname, "../admin/dist", "index.html")
    );
  });
}

app.listen(ENV.PORT, () => {
  console.log(`🚀 Server running on port ${ENV.PORT}`);
});
