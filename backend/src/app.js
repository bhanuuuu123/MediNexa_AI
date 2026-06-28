import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cookieParser()); // Parse cookies from requests

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Logging
app.use(morgan("tiny"));

// Static files
app.use("/uploads", express.static("uploads"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Try again later." },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/";
  },
});
app.use(limiter);

// API routes
app.use("/api", routes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "MediNexa AI Backend Running" });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Startup logging
app.on("listening", () => {
  logger.info("Express server listening");
});

export default app;
