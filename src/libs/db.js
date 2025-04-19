import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

import { Logger } from "./logger.js";
const logger = new Logger("MySQL");

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

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

await initDatabase();
