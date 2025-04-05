/**
 * Simple metrics collection
 */
class Metrics {
  constructor() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      apiLatency: [],
    };

    // Reset latency array periodically to prevent memory issues
    setInterval(() => {
      this.metrics.apiLatency = this.metrics.apiLatency.slice(-100);
    }, 60000);
  }

  /**
   * Increment request counter
   */
  incrementRequestCount() {
    this.metrics.requestCount++;
  }

  /**
   * Increment error counter
   */
  incrementErrorCount() {
    this.metrics.errorCount++;
  }

  /**
   * Record a cache hit
   */
  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  /**
   * Record a cache miss
   */
  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  /**
   * Record API latency
   * @param {number} ms - Latency in milliseconds
   */
  recordLatency(ms) {
    this.metrics.apiLatency.push(ms);
  }

  /**
   * Get all metrics
   * @returns {Object} - Metrics object
   */
  getMetrics() {
    const avgLatency =
      this.metrics.apiLatency.length > 0
        ? this.metrics.apiLatency.reduce((sum, val) => sum + val, 0) /
          this.metrics.apiLatency.length
        : 0;

    return {
      requests: {
        total: this.metrics.requestCount,
        errors: this.metrics.errorCount,
        success_rate:
          this.metrics.requestCount > 0
            ? (
                ((this.metrics.requestCount - this.metrics.errorCount) /
                  this.metrics.requestCount) *
                100
              ).toFixed(2) + "%"
            : "0%",
      },
      cache: {
        hits: this.metrics.cacheHits,
        misses: this.metrics.cacheMisses,
        hit_rate:
          this.metrics.cacheHits + this.metrics.cacheMisses > 0
            ? (
                (this.metrics.cacheHits /
                  (this.metrics.cacheHits + this.metrics.cacheMisses)) *
                100
              ).toFixed(2) + "%"
            : "0%",
      },
      latency: {
        average_ms: avgLatency.toFixed(2),
        samples: this.metrics.apiLatency.length,
      },
    };
  }
}

export const metrics = new Metrics();
