import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();
import { Cache } from "./cache.js";
import { Logger } from "./logger.js";
import { fetchWithRetry } from "./fetch-with-retry.js";
import { metrics } from "./metrics.js";

// Initialize API domain allowed
const allowedAPILinks = process.env.ALLOWED_API_LINKS?.split(",") || "*";
if (allowedAPILinks !== "*") {
  allowedAPILinks.push(process.env.API_URL || `http://localhost:${PORT}`);
}

// Middleware for domain verification
app.use((req, res, next) => {
  const host = req.headers.host;

  // If the request domain does not match the authorized domain
  if (host !== allowedAPILinks) {
    // Redirects to the correct domain, retaining the original URL
    return res.redirect(301, `https://${allowedAPILinks}${req.originalUrl}`);
  }
  next();
});

// Initialize logger
const logger = new Logger("UptimeRobot API");

// Environment variables
const PORT = process.env.PORT || 3000;
const UPTIME_ROBOT_API_KEY = process.env.UPTIME_ROBOT_API_KEY;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || "*";
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

// Initialize caches
const monitorsCache = new Cache(5 * 60 * 1000); // 5 minutes TTL
const monitorDetailsCache = new Cache(2 * 60 * 1000); // 2 minutes TTL

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(limiter);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  metrics.incrementRequestCount();

  res.on("finish", () => {
    const duration = Date.now() - start;
    metrics.recordLatency(duration);

    if (res.statusCode >= 400) {
      metrics.incrementErrorCount();
    }

    logger.info(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
});

// Endpoint to get all monitors
app.get("/api/monitors", async (req, res, next) => {
  try {
    // Check cache first
    const cachedData = monitorsCache.get("all_monitors");
    if (cachedData) {
      logger.debug("Returning cached monitors data");
      metrics.recordCacheHit();
      return res.json(cachedData);
    }

    metrics.recordCacheMiss();
    logger.info("Fetching fresh monitors data from UptimeRobot API");

    const response = await fetchWithRetry(
      "https://api.uptimerobot.com/v2/getMonitors",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          api_key: UPTIME_ROBOT_API_KEY,
          format: "json",
          logs: 1,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      logger.error("UptimeRobot API error", { status: response.status, data });
      return res.status(response.status || 500).json({
        error: "Failed to fetch monitors",
        details: data,
      });
    }

    // Cache the successful response
    monitorsCache.set("all_monitors", data);
    res.json(data);
  } catch (error) {
    logger.error("Error in /api/monitors", { error: error.message });
    next(error);
  }
});

// Endpoint to get specific monitor details
app.get("/api/monitor/:pageId/:monitorId", async (req, res, next) => {
  try {
    const { pageId, monitorId } = req.params;
    const cacheKey = `monitor_${pageId}_${monitorId}`;

    // Check cache first
    const cachedData = monitorDetailsCache.get(cacheKey);
    if (cachedData) {
      logger.debug(`Returning cached data for monitor ${monitorId}`);
      metrics.recordCacheHit();
      return res.json(cachedData);
    }

    metrics.recordCacheMiss();
    logger.info(`Fetching fresh data for monitor ${monitorId}`);

    const response = await fetchWithRetry(
      `https://stats.uptimerobot.com/api/getMonitor/${pageId}?m=${monitorId}`,
      {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      logger.error("UptimeRobot status page API error", {
        status: response.status,
        data,
      });
      return res.status(response.status || 500).json({
        error: "Failed to fetch monitor details",
        details: data,
      });
    }

    // Cache the successful response
    monitorDetailsCache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    logger.error("Error in /api/monitor/:pageId/:monitorId", {
      error: error.message,
    });
    next(error);
  }
});

// Endpoint to manually clear cache
app.post("/api/clear-cache", (req, res) => {
  monitorsCache.clear();
  monitorDetailsCache.clear();
  logger.info("Cache cleared manually");
  res.json({ success: true, message: "Cache cleared successfully" });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    version: "1.0.0",
  });
});

// Metrics endpoint
app.get("/metrics", (req, res) => {
  res.json(metrics.getMetrics());
});

// Catch-all for 404 errors
app.use((req, res) => {
  logger.warn(`Route not found: ${req.originalUrl}`);
  res.status(404).json({ error: "Not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({ error: "Internal server error" });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API URL: ${API_URL}`);
});
