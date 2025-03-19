import { env } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { CacheService } from "./cache-service";

/**
 * Service for managing user-related operations
 */
export class UserService {
  // Cache TTL for user groups (10 minutes)
  private static USER_GROUPS_TTL = 10 * 60 * 1000;

  /**
   * Get user ID from cookies
   */
  static getUserIdFromCookies(cookies: any): string | null {
    // Try to get from user_id cookie first
    const userId = cookies.get("user_id");
    if (userId) {
      return userId;
    }

    // Otherwise, try to extract from auth_token
    try {
      const authCookie = cookies.get("auth_token");
      if (authCookie) {
        const authData = JSON.parse(authCookie);
        return authData.user_id || null;
      }
    } catch (e) {
      console.warn("Failed to extract user ID from auth token:", e);
    }

    return null;
  }

  /**
   * Fetch groups for a specific user
   */
  static async fetchUserGroups(
    userId: string,
    fetch: typeof globalThis.fetch,
    headers: Record<string, string>
  ): Promise<any[]> {
    // Generate cache key
    const cacheKey = `user_groups_${userId}`;

    // Check cache first
    const cachedGroups = CacheService.get<any[]>(cacheKey);
    if (cachedGroups) {
      return cachedGroups;
    }

    const apiUrl = `${publicEnv.PUBLIC_OIDC_ISSUER}/api/users/${userId}/groups`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user groups: ${response.status}`);
    }

    const groupsData = await response.json();
    const groups = groupsData.data || [];

    // Store in cache
    CacheService.set(cacheKey, groups, this.USER_GROUPS_TTL);

    return groups;
  }
}
