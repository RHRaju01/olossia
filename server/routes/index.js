import express from "express";
import authRoutes from "./auth.js";
import productRoutes from "./products.js";
import cartRoutes from "./cart.js";

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);

export default router;
