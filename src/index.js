import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();
import { db } from "./libs/db.js";
import { Cache } from "./libs/cache.js";
import { Logger } from "./libs/logger.js";
import { fetchWithRetry } from "./utils/fetch-with-retry.js";
import { metrics } from "./utils/metrics.js";
import {
  monitorTypeMapping,
  monitorSubTypeMapping,
  monitorStatusMapping,
} from "./utils/mappings.js";
import { isIP } from "net";

// Initialize logger
const logger = new Logger("UptimeRobot API");
const loggerSql = new Logger("MySQL");

// Environment variables
const PORT = process.env.PORT || 3000;
const ACCOUNT_PRIVACY = process.env.ACCOUNT_PRIVACY || true;

const UPTIME_ROBOT_API_KEY_MAIN = process.env.UPTIME_ROBOT_API_KEY_MAIN;
const UPTIME_ROBOT_API_KEY_READ_ONLY =
  process.env.UPTIME_ROBOT_API_KEY_READ_ONLY;
if (!UPTIME_ROBOT_API_KEY_READ_ONLY) {
  logger.error(
    "Missing UPTIME_ROBOT_API_KEY_READ_ONLY in environment variables."
  );
  process.exit(1);
}
const DB_ACTIVE = process.env.DB_ACTIVE || false;

const UPTIME_ROBOT_API_URL = "https://api.uptimerobot.com/v2";
const UPTIME_ROBOT_API_PAGES_URL = "https://stats.uptimerobot.com/api";

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || "";
const allowedOrigins = ALLOWED_ORIGINS.split(",").map((origin) =>
  origin.trim()
);

const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

// Initialize caches
const monitorsCache = new Cache(5 * 60 * 1000);
const monitorDetailsCache = new Cache(2 * 60 * 1000);
const pspCache = new Cache(2 * 60 * 1000);
const accountCache = new Cache(2 * 60 * 1000);

// Initialize Express app
const app = express();
app.set("trust proxy", "loopback");

// Middleware for domain verification
app.use((req, res, next) => {
  const host = req.headers.host;
  const localDomain = `localhost:${PORT}`;
  const allowedDomain =
    process.env.API_URL?.replace(/https?:\/\//, "") || localDomain;

  if (host !== allowedDomain && host !== localDomain) {
    return res.redirect(301, `https://${allowedDomain}${req.originalUrl}`);
  }
  next();
});

// Security middleware
app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow non-browser requests

      const isAllowed = allowedOrigins.some((allowed) =>
        origin.startsWith(allowed)
      );
      if (isAllowed) return callback(null, true);

      console.error("CORS blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
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
  const clientIp = req.ip;

  res.on("finish", () => {
    const duration = Date.now() - start;
    metrics.recordLatency(duration);

    if (res.statusCode >= 400) {
      metrics.incrementErrorCount();
    }

    if (!isIP(clientIp)) {
      logger.warn("Invalid IP address detected", { ip: clientIp });
    }

    logger.info(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: clientIp,
    });
  });

  next();
});

if (UPTIME_ROBOT_API_KEY_MAIN) {
  // Endpoint: Get account details
  app.get("/api/account-details", async (req, res, next) => {
    const cachedData = accountCache.get("account_details");
    if (cachedData) {
      logger.debug("Returning cached account details data");
      metrics.recordCacheHit();
      return res.json({ success: true, data: cachedData });
    }

    metrics.recordCacheMiss();
    logger.info("Fetching fresh account details data from UptimeRobot API");

    try {
      const response = await fetchWithRetry(
        `${UPTIME_ROBOT_API_URL}/getAccountDetails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({
            api_key: UPTIME_ROBOT_API_KEY_MAIN,
            format: "json",
          }),
        }
      );

      const resData = await response.json();

      if (!response.ok) {
        logger.error("UptimeRobot API error", {
          status: response.status,
          data: resData,
        });
        return res.status(response.status || 500).json({
          success: false,
          error: {
            code: response.status || 500,
            message: "Failed to fetch account details",
            details: resData,
          },
        });
      }

      if (ACCOUNT_PRIVACY && resData?.account) {
        const { account } = resData;

        delete account.email;
        delete account.firstname;
        delete account.user_id;
        delete account.payment_processor;
        delete account.payment_period;
        delete account.subscription_expiry_date;
        delete account.active_subscription;
        delete account.sms_credits;
        delete account.registered_at;
      }

      const data = {
        ...resData,
        account_privacy: ACCOUNT_PRIVACY,
      };

      accountCache.set("account_details", data);
      res.json({ success: true, data });
    } catch (error) {
      logger.error("Error in /api/account-details", { error: error.message });
      next(error);
    }
  });
}

if (UPTIME_ROBOT_API_KEY_READ_ONLY) {
  // Endpoint: Get all monitors
  app.get("/api/monitors", async (req, res, next) => {
    try {
      const cachedData = monitorsCache.get("all_monitors");
      if (cachedData) {
        logger.debug("Returning cached monitors data");
        metrics.recordCacheHit();
        return res.json({ success: true, data: cachedData });
      }

      metrics.recordCacheMiss();
      logger.info("Fetching fresh monitors data from UptimeRobot API");

      const response = await fetchWithRetry(
        `${UPTIME_ROBOT_API_URL}/getMonitors`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({
            api_key: UPTIME_ROBOT_API_KEY_READ_ONLY,
            format: "json",
            all_time_uptime_ratio: 1,
            all_time_uptime_durations: 1,
            response_times_average: 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        logger.error("UptimeRobot API error", {
          status: response.status,
          data,
        });
        return res.status(response.status || 500).json({
          success: false,
          error: {
            code: response.status || 500,
            message: "Failed to fetch monitors",
            details: data,
          },
        });
      }

      if (data?.monitors?.length) {
        data.monitors = data.monitors.map((monitor) => {
          if (monitor.hasOwnProperty("type")) {
            monitor.type = monitorTypeMapping[monitor.type] || monitor.type;
          }
          if (monitor.hasOwnProperty("sub_type")) {
            monitor.sub_type =
              monitorSubTypeMapping[monitor.sub_type] || monitor.sub_type;
          }
          if (monitor.hasOwnProperty("status")) {
            monitor.status =
              monitorStatusMapping[monitor.status] || monitor.status;
          }
          if (monitor.hasOwnProperty("all_time_uptime_ratio")) {
            monitor.all_time_uptime_ratio = parseFloat(
              monitor.all_time_uptime_ratio
            ).toFixed(2);
          }
          return monitor;
        });

        if (DB_ACTIVE === true) {
          // 🔌 Save to DB
          // 💾 Retrieve all existing DB monitors
          const [existingMonitors] = await db.query(
            `SELECT id FROM monitors WHERE id = ?`,
            [monitorId]
          );

          const existingMonitorsIds = new Set(
            existingMonitors.map((row) => row.id)
          );

          // 💾 Filter new logs
          const logs = data.monitors[0]?.logs || [];

          for (const monitor of data.monitors) {
            const { id, friendly_name, url } = monitor;

            // 👉 If the monitor already exists, skip
            if (existingMonitorsIds.has(id)) continue;
            try {
              await db.query(
                `INSERT IGNORE INTO monitors (id, friendly_name, url) VALUES (?, ?, ?)`,
                [id, friendly_name, url]
              );
              loggerSql.info("MySQL insert monitor success", {
                id,
                friendly_name,
                url,
              });
            } catch (err) {
              loggerSql.error("MySQL insert monitor error", {
                error: err.message,
              });
            }
          }
        }
      }

      monitorsCache.set("all_monitors", data);
      res.json({ success: true, data });
    } catch (error) {
      logger.error("Error in /api/monitors", { error: error.message });
      next(error);
    }
  });

  // Endpoint: Get monitor details with monitors by ID with getMonitors [Real API authorized]
  app.get("/api/monitor/:monitorId", async (req, res, next) => {
    const { monitorId } = req.params;

    if (!monitorId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "Missing required query parameter: monitorId",
        },
      });
    }

    const cacheKey = `monitor_${monitorId}`;
    const cachedData = monitorDetailsCache.get(cacheKey);
    if (cachedData) {
      logger.debug(`Returning cached data for monitor ${monitorId}`);
      metrics.recordCacheHit();
      return res.json({ success: true, data: cachedData });
    }

    metrics.recordCacheMiss();
    logger.info(`Fetching fresh data for monitor ${monitorId}`);

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const responseTimesStartDate = Math.floor(sevenDaysAgo.getTime() / 1000);

      const response = await fetchWithRetry(
        `${UPTIME_ROBOT_API_URL}/getMonitors`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({
            api_key: UPTIME_ROBOT_API_KEY_READ_ONLY,
            format: "json",
            all_time_uptime_ratio: 1,
            all_time_uptime_durations: 1,
            response_times_average: 1,
            response_times_start_date: responseTimesStartDate,
            response_times_end_date: Math.floor(Date.now() / 1000),
            logs: 1,
            response_times: 1,
            response_times_count: 1,
            mwindows: 1,
            timezone: 1,
            ssl: 1,
            monitors: monitorId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        logger.error("UptimeRobot API error", {
          status: response.status,
          data,
        });
        return res.status(response.status || 500).json({
          success: false,
          error: {
            code: response.status || 500,
            message: "Failed to fetch monitors",
            details: data,
          },
        });
      }

      // 🔄 Property mapping
      if (data?.monitors?.length) {
        data.monitors = data.monitors.map((monitor) => {
          if (monitor.hasOwnProperty("type")) {
            monitor.type = monitorTypeMapping[monitor.type] || monitor.type;
          }
          if (monitor.hasOwnProperty("sub_type")) {
            monitor.sub_type =
              monitorSubTypeMapping[monitor.sub_type] || monitor.sub_type;
          }
          if (monitor.hasOwnProperty("status")) {
            monitor.status =
              monitorStatusMapping[monitor.status] || monitor.status;
          }
          if (monitor.hasOwnProperty("all_time_uptime_ratio")) {
            monitor.all_time_uptime_ratio = parseFloat(
              monitor.all_time_uptime_ratio
            ).toFixed(2);
          }
          return monitor;
        });

        if (DB_ACTIVE === true) {
          // 💾 Store new logs
          // 💾 Retrieve all existing DB logs for this monitor
          const [existingLogs] = await db.query(
            `SELECT id FROM monitor_logs WHERE monitor_id = ?`,
            [monitorId]
          );

          const existingLogIds = new Set(existingLogs.map((row) => row.id));

          // 💾 Filter new logs
          const logs = data.monitors[0]?.logs || [];

          for (const log of logs) {
            const { id, type, datetime, duration, reason } = log;

            // 👉 If the log already exists, skip
            if (existingLogIds.has(id)) continue;

            try {
              await db.query(
                `INSERT INTO monitor_logs 
       (id, monitor_id, type, datetime, duration, reason_code, reason_detail)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  id,
                  monitorId,
                  type,
                  datetime,
                  duration,
                  reason.code,
                  reason.detail,
                ]
              );

              loggerSql.info("MySQL log insert success", {
                id,
                monitorId,
                type,
                datetime,
                duration,
                reason_code: reason.code,
                reason_detail: reason.detail,
              });
            } catch (err) {
              loggerSql.error("MySQL log insert error", { error: err.message });
            }
          }

          // 📤 Retrieve all logs from the DB
          const [dbLogs] = await db.query(
            `SELECT id, type, datetime, duration, reason_code AS code, reason_detail AS detail
           FROM monitor_logs WHERE monitor_id = ? ORDER BY datetime DESC`,
            [monitorId]
          );

          data.monitors[0].logs = dbLogs.map((log) => ({
            id: log.id,
            type: log.type,
            datetime: log.datetime,
            duration: log.duration,
            reason: {
              code: log.code,
              detail: log.detail,
            },
          }));
        }
      }

      monitorDetailsCache.set(cacheKey, data);
      res.json({ success: true, data });
    } catch (error) {
      logger.error("Error in /api/monitor/:monitorId", {
        error: error.message,
      });
      next(error);
    }
  });

  // Endpoint: Get specific monitor details with public page method [Not a real API authorized]
  app.get("/api/monitor/:pageId/:monitorId", async (req, res, next) => {
    try {
      const { pageId, monitorId } = req.params;
      const cacheKey = `psp_monitor_${pageId}_${monitorId}`;

      const cachedData = monitorDetailsCache.get(cacheKey);
      if (cachedData) {
        logger.debug(
          `Returning cached data for monitor ${monitorId} with pageId ${pageId}`
        );
        metrics.recordCacheHit();
        return res.json({ success: true, data: cachedData });
      }

      metrics.recordCacheMiss();
      logger.info(`Fetching fresh data for monitor ${monitorId}`);

      const response = await fetchWithRetry(
        `${UPTIME_ROBOT_API_PAGES_URL}/getMonitor/${pageId}?m=${monitorId}`,
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
          success: false,
          error: {
            code: response.status || 500,
            message: "Failed to fetch monitor details",
            details: data,
          },
        });
      }

      monitorDetailsCache.set(cacheKey, data);
      res.json({ success: true, data });
    } catch (error) {
      logger.error("Error in /api/monitor/:pageId/:monitorId", {
        error: error.message,
      });
      next(error);
    }
  });

  // Endpoint: Get all public pages
  app.get("/api/public-pages", async (req, res, next) => {
    const cachedData = pspCache.get("public_pages");
    if (cachedData) {
      logger.debug("Returning cached public pages data");
      metrics.recordCacheHit();
      return res.json({ success: true, data: cachedData });
    }

    metrics.recordCacheMiss();
    logger.info("Fetching fresh public pages data from UptimeRobot API");

    try {
      const response = await fetchWithRetry(`${UPTIME_ROBOT_API_URL}/getPSPs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          api_key: UPTIME_ROBOT_API_KEY_READ_ONLY,
          format: "json",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error("UptimeRobot API error", {
          status: response.status,
          data,
        });
        return res.status(response.status || 500).json({
          success: false,
          error: {
            code: response.status || 500,
            message: "Failed to fetch public pages",
            details: data,
          },
        });
      }

      pspCache.set("public_pages", data);
      res.json({ success: true, data });
    } catch (error) {
      logger.error("Error in /api/public-pages", { error: error.message });
      next(error);
    }
  });
}

// Endpoint: Clear cache
app.post("/api/clear-cache", (req, res) => {
  monitorsCache.clear();
  monitorDetailsCache.clear();
  pspCache.clear();
  accountCache.clear();
  logger.info("Cache cleared manually");
  res.json({ success: true, data: { message: "Cache cleared successfully" } });
});

// Health check
app.get("/ws/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      uptime: process.uptime(),
      timestamp: Date.now(),
      version: "1.0.0",
    },
  });
});

// Metrics endpoint
app.get("/ws/metrics", (req, res) => {
  res.json({ success: true, data: metrics.getMetrics() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 404,
      message: "The requested resource has not been found.",
      method: req.method,
      endpoint: req.originalUrl,
      timestamp: new Date().toISOString(),
    },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: {
      code: 500,
      message: "Internal server error",
      details: err.message,
      timestamp: new Date().toISOString(),
    },
  });
});

// Start server (:)
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API URL: ${API_URL}`);
  logger.info(`UptimeRobot API URL: ${UPTIME_ROBOT_API_URL}`);
  logger.info(`UptimeRobot API Pages URL: ${UPTIME_ROBOT_API_PAGES_URL}`);
  logger.info(`UptimeRobot API Key (Main): ${UPTIME_ROBOT_API_KEY_MAIN}`);
  logger.info(
    `UptimeRobot API Key (Read-Only): ${UPTIME_ROBOT_API_KEY_READ_ONLY}`
  );
  logger.info(`Account Privacy: ${ACCOUNT_PRIVACY}`);
  logger.info(`Allowed origins: ${ALLOWED_ORIGINS}`);
});
