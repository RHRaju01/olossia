import express from "express";
import { authController } from "../controllers/authController.js";
import {
  validateRegistration,
  validateLogin,
} from "../middleware/validation.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/security.js";

const router = express.Router();

// Apply auth rate limiting to all auth routes
router.use(authLimiter);

// Public routes
router.post("/register", validateRegistration, authController.register);
router.post("/login", validateLogin, authController.login);

// Protected routes
router.get("/profile", authenticate, authController.getProfile);
router.post("/logout", authenticate, authController.logout);
router.post("/refresh", authController.refresh);

export default router;
