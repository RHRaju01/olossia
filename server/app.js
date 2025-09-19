import express from "express";
import cors from "cors";
import morgan from "morgan";
import { securityHeaders, generalLimiter } from "./middleware/security.js";
import routes from "./routes/index.js";

// Build express app (exported for testing)
const app = express();

// Security middleware
app.use(securityHeaders);
app.use(generalLimiter);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Logging
app.use(morgan("combined"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/v1", routes);

// 404
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Export app for tests
export default app;
