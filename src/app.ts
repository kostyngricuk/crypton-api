import cors from "cors";
import express from "express";
import helmet from "helmet";
import { getAllowedDomains } from "./config/env";
import { bearerAuth } from "./middleware/bearerAuth";
import { domainWhitelist } from "./middleware/domainWhitelist";
import { errorHandler } from "./middleware/errorHandler";

import accountRoutes from "./routes/account";
// Route imports
import healthRoutes from "./routes/health";
import positionRoutes from "./routes/positions";
import serverInfoRoutes from "./routes/serverInfo";
import symbolRoutes from "./routes/symbols";
import tradeRoutes from "./routes/trades";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        // Allow requests with no origin (e.g., mobile apps, Postman)
        callback(null, true);
        return;
      }

      const allowedDomains = getAllowedDomains();
      const hostname = new URL(origin).hostname;

      const isAllowed = allowedDomains.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Bearer authentication middleware (runs before domain whitelist to fail fast)
app.use(bearerAuth);

// Domain whitelist middleware
app.use(domainWhitelist);

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/symbols", symbolRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/server", serverInfoRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `The route ${req.method} ${req.originalUrl} does not exist`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
