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
router.post("/send-verify", authController.sendVerificationEmail);
router.post("/password-reset/request", authController.requestPasswordReset);
router.post("/password-reset/confirm", authController.confirmPasswordReset);

// Protected routes
router.get("/profile", authenticate, authController.getProfile);
// Allow logout to be called with a refresh token only (no access token required)
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/verify", authController.verifyEmail);

export default router;
