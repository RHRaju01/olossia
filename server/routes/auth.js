import express from "express";
import { signup, signin } from "../controllers/authController.js";

const router = express.Router();

// Auth routes
router.post("/register", signup);
router.post("/login", signin);

export default router;
