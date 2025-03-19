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
    try {
      const item = this.cache[key];

      if (!item) {
        return null;
      }

      // Check if item has expired
      const now = Date.now();
      if (now > item.timestamp) {
        // Item has expired
        console.log(`Cache expired for key "${key}"`);
        delete this.cache[key];
        return null;
      }
      return item.data as T;
    } catch (error) {
      console.error(`Error retrieving from cache for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  static set<T>(key: string, data: T, ttlMs: number = this.DEFAULT_TTL): void {
    try {
      // Calculate expiration timestamp
      const timestamp = Date.now() + ttlMs;

      // Store in cache
      this.cache[key] = {
        data,
        timestamp,
      };
    } catch (error) {
      console.error(`Error setting cache for key "${key}":`, error);
    }
  }

  /**
   * Clear specific cache entry
   */
  static clear(key: string): void {
    delete this.cache[key];
    console.log(`Cleared cache for "${key}"`);
  }

  /**
   * Clear all cache entries
   */
  static clearAll(): void {
    this.cache = {};
    console.log("Cleared all cache entries");
  }

  /**
   * Debug method to see all cache keys
   */
  static getAllKeys(): string[] {
    return Object.keys(this.cache);
  }

  /**
   * Debug method to get cache statistics
   */
  static getStats(): {
    totalItems: number;
    keys: string[];
    entries: Record<
      string,
      { dataType: string; expiresIn: string; dataPreview: string }
    >;
  } {
    const now = Date.now();
    const entries: Record<
      string,
      { dataType: string; expiresIn: string; dataPreview: string }
    > = {};

    for (const key of Object.keys(this.cache)) {
      const item = this.cache[key];
      const dataType = Array.isArray(item.data)
        ? `Array[${item.data.length}]`
        : typeof item.data;
      const expiresIn = `${Math.round((item.timestamp - now) / 1000)}s`;
      const dataPreview =
        JSON.stringify(item.data).substring(0, 50) +
        (JSON.stringify(item.data).length > 50 ? "..." : "");

      entries[key] = { dataType, expiresIn, dataPreview };
    }

    return {
      totalItems: Object.keys(this.cache).length,
      keys: Object.keys(this.cache),
      entries,
    };
  }
}
