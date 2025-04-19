import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
import { Logger } from "./logger.js";

const logger = new Logger("MySQL");
const DB_ACTIVE = process.env.DB_ACTIVE || false;

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

if (DB_ACTIVE === true) {
  async function initDatabase() {
    try {
      const createMonitorsTable = `
      CREATE TABLE IF NOT EXISTS monitors (
        id BIGINT PRIMARY KEY,
        friendly_name VARCHAR(255),
        url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

      const createLogsTable = `
      CREATE TABLE IF NOT EXISTS monitor_logs (
        id BIGINT PRIMARY KEY,
        monitor_id BIGINT,
        type INT,
        datetime BIGINT,
        duration INT,
        reason_code VARCHAR(50),
        reason_detail TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (monitor_id) REFERENCES monitors(id)
      );
    `;

      const connection = await db.getConnection();
      await connection.query(createMonitorsTable);
      await connection.query(createLogsTable);
      connection.release();

      logger.info("MySQL tables checked and ready ✅");
    } catch (err) {
      logger.error("Error initializing database", { error: err.message });
      process.exit(1);
    }
  }

  // Appeler la fonction explicitement
  initDatabase().catch((err) => {
    logger.error("Database initialization failed", { error: err.message });
    process.exit(1);
  });
} else {
  logger.warn("MySQL is disabled. No database connection will be made.");
  logger.warn("Set DB_ACTIVE=true in .env to enable MySQL.");
}
