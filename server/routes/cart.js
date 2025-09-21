import express from "express";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeCart,
} from "../controllers/cartController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Require authentication for cart operations
router.get("/", authenticate, getCart);
router.post("/items", authenticate, addCartItem);
router.put("/items/:id", authenticate, updateCartItem);
router.delete("/items/:id", authenticate, removeCartItem);
router.delete("/", authenticate, clearCart);
router.post("/merge", authenticate, mergeCart);

export default router;
