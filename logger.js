import dotenv from "dotenv";
dotenv.config();

/**
 * Simple logger implementation
 */
export class Logger {
  /**
   * Create a new logger
   * @param {string} serviceName - Name of the service
   */
  constructor(serviceName = "UptimeRobot API") {
    this.serviceName = serviceName;
  }

  /**
   * Format a log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   * @returns {Object} - Formatted log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      service: this.serviceName,
      message,
      ...meta,
    };
  }

  /**
   * Log a message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  log(level, message, meta) {
    const formattedMessage = this.formatMessage(level, message, meta);
    console.log(JSON.stringify(formattedMessage));
  }

  /**
   * Log an info message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta) {
    this.log("info", message, meta);
  }

  /**
   * Log an error message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  error(message, meta) {
    this.log("error", message, meta);
  }

  /**
   * Log a warning message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta) {
    this.log("warn", message, meta);
  }

  /**
   * Log a debug message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta) {
    if (process.env.NODE_ENV !== "production") {
      this.log("debug", message, meta);
    }
  }
}
