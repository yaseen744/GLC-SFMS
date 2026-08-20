import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./src/config/db.js";

import authRoutes from "./src/routes/authRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import feeRoutes from "./src/routes/feeRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Make sure we're connected to MongoDB before any route handler runs.
// Cheap no-op once already connected (see src/config/db.js caching).
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: "Database unavailable, please try again shortly" });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
