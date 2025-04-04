/**
 * Simple in-memory cache implementation
 */
export class Cache {
  /**
   * Create a new cache
   * @param {number} ttl - Time to live in milliseconds
   */
  constructor(ttl = 60000) {
    // Default TTL: 60 seconds
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @returns {any} - The cached value
   */
  set(key, value) {
    const item = {
      value,
      expiry: Date.now() + this.ttl,
    };
    this.cache.set(key, item);
    return value;
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {any|null} - The cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Remove a specific item from the cache
   * @param {string} key - Cache key
   */
  invalidate(key) {
    this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  clear() {
    this.cache.clear();
  }
}
