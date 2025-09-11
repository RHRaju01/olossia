import express from "express";
import { wishlistController } from "../controllers/wishlistController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All wishlist routes require authentication
router.use(authenticate);

// Wishlist routes
router.get("/", wishlistController.getWishlist);
router.post("/add", wishlistController.addToWishlist);
router.post("/toggle", wishlistController.toggleWishlist);
router.delete("/remove/:productId", wishlistController.removeFromWishlist);
router.delete("/clear", wishlistController.clearWishlist);

export default router;
