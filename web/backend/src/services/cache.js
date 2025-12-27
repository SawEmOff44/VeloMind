// Simple in-memory cache with TTL (Time To Live)
// For production, consider Redis or similar

class Cache {
  constructor() {
    this.cache = new Map()
    this.ttls = new Map()
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
   */
  set(key, value, ttl = 300) {
    this.cache.set(key, value)
    
    if (ttl > 0) {
      const expiresAt = Date.now() + (ttl * 1000)
      this.ttls.set(key, expiresAt)
      
      // Auto-cleanup after TTL
      setTimeout(() => {
        this.delete(key)
      }, ttl * 1000)
    }
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    // Check if key exists
    if (!this.cache.has(key)) {
      return null
    }

    // Check if expired
    const expiresAt = this.ttls.get(key)
    if (expiresAt && Date.now() > expiresAt) {
      this.delete(key)
      return null
    }

    return this.cache.get(key)
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key)
    this.ttls.delete(key)
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear()
    this.ttls.clear()
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * Get or compute value (cache-aside pattern)
   * @param {string} key - Cache key
   * @param {Function} fn - Async function to compute value if not cached
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>}
   */
  async getOrSet(key, fn, ttl = 300) {
    const cached = this.get(key)
    if (cached !== null) {
      return cached
    }

    const value = await fn()
    this.set(key, value, ttl)
    return value
  }

  /**
   * Invalidate cache keys by pattern
   * @param {string} pattern - Pattern to match (simple wildcard support)
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    const keysToDelete = []
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.delete(key))
    return keysToDelete.length
  }
}

// Create singleton instance
const cache = new Cache()

// Cache key builders
export const cacheKeys = {
  sessions: (userId, limit, offset) => `sessions:${userId}:${limit}:${offset}`,
  session: (sessionId) => `session:${sessionId}`,
  sessionAnalytics: (sessionId) => `session_analytics:${sessionId}`,
  routes: (userId) => `routes:${userId}`,
  route: (routeId) => `route:${routeId}`,
  parameters: (userId) => `parameters:${userId}`,
  activeParameters: (userId) => `parameters:active:${userId}`,
  analyticsOverview: (userId, timeframe) => `analytics:overview:${userId}:${timeframe}`,
  analyticsTrends: (userId, metric, timeframe) => `analytics:trends:${userId}:${metric}:${timeframe}`,
  analyticsRecords: (userId) => `analytics:records:${userId}`,
  waypoints: (routeId) => `waypoints:${routeId}`,
  user: (userId) => `user:${userId}`
}

// Cache TTL presets (in seconds)
export const cacheTTL = {
  SHORT: 60,        // 1 minute - for frequently changing data
  MEDIUM: 300,      // 5 minutes - for moderate data
  LONG: 1800,       // 30 minutes - for stable data
  VERY_LONG: 3600   // 1 hour - for rarely changing data
}

// Middleware for caching
export const cacheMiddleware = (keyFn, ttl = cacheTTL.MEDIUM) => {
  return async (req, res, next) => {
    const key = keyFn(req)
    const cached = cache.get(key)
    
    if (cached) {
      return res.json(cached)
    }
    
    // Store original json method
    const originalJson = res.json.bind(res)
    
    // Override json method to cache response
    res.json = function(data) {
      cache.set(key, data, ttl)
      return originalJson(data)
    }
    
    next()
  }
}

// Helper to invalidate user-specific caches
export const invalidateUserCache = (userId) => {
  cache.invalidatePattern(`*:${userId}*`)
}

export default cache
