/**
 * Simple in-memory cache service for API responses
 */
export class CacheService {
  // In-memory cache storage
  private static cache: Record<
    string,
    {
      data: any;
      timestamp: number;
    }
  > = {};

  // Default TTL in milliseconds (5 minutes)
  private static DEFAULT_TTL = 5 * 60 * 1000;

  /**
   * Get data from cache
   */
  static get<T>(key: string): T | null {
    const item = this.cache[key];

    if (!item) {
      return null;
    }

    // Check if item has expired
    const now = Date.now();
    if (now > item.timestamp) {
      // Item has expired
      delete this.cache[key];
      return null;
    }

    return item.data as T;
  }

  /**
   * Set data in cache
   */
  static set<T>(key: string, data: T, ttlMs: number = this.DEFAULT_TTL): void {
    // Calculate expiration timestamp
    const timestamp = Date.now() + ttlMs;

    // Store in cache
    this.cache[key] = {
      data,
      timestamp,
    };
  }

  /**
   * Clear specific cache entry
   */
  static clear(key: string): void {
    delete this.cache[key];
  }

  /**
   * Clear all cache entries
   */
  static clearAll(): void {
    this.cache = {};
  }
}
