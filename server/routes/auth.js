import express from "express";
import { signup, signin, refreshToken, getProfile } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Auth routes
router.post("/register", signup);
router.post("/login", signin);
router.post("/refresh", refreshToken);
router.get("/profile", authenticate, getProfile);

export default router;
