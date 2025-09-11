import express from "express";
import { cartController } from "../controllers/cartController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// Cart routes
router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.put("/update/:productId", cartController.updateQuantity);
router.delete("/remove/:productId", cartController.removeFromCart);
router.delete("/clear", cartController.clearCart);

export default router;
