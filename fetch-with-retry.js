import fetch from "node-fetch";
import { Logger } from "./logger.js";

const logger = new Logger("FetchWithRetry");

/**
 * Fetch with retry functionality
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise<Response>} - Fetch response
 */
export async function fetchWithRetry(
  url,
  options = {},
  retries = 3,
  delay = 1000
) {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (retries <= 1) {
      logger.error(`Fetch failed after all retries: ${url}`, {
        error: error.message,
      });
      throw error;
    }

    logger.warn(
      `Fetch failed, retrying (${retries - 1} attempts left): ${url}`,
      { error: error.message }
    );

    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry(url, options, retries - 1, delay * 1.5); // Exponential backoff
  }
}
