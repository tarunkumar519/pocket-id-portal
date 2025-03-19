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

    // IMPORTANT: Clear the cache key first to ensure we get fresh data
    CacheService.clear(cacheKey);

    console.log(`Fetching groups for user ${userId} from API`);
    const apiUrl = `${publicEnv.PUBLIC_OIDC_ISSUER}/api/users/${userId}/groups`;

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        console.error(`API returned status ${response.status} for user groups`);
        // Check if we got a rate limit error
        if (response.status === 429) {
          console.log("Rate limited, trying once more with delay");
          // Wait 2 seconds and try again
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return this.fetchUserGroups(userId, fetch, headers);
        }
        throw new Error(`Failed to fetch user groups: ${response.status}`);
      }

      // Use response.clone() to be able to read the body multiple times
      const responseClone = response.clone();

      // Try to parse as JSON directly first
      try {
        const data = await response.json();

        // Check different possible formats of the response
        let groups;
        if (data.data && Array.isArray(data.data)) {
          groups = data.data;
        } else if (Array.isArray(data)) {
          groups = data;
        } else if (data.groups && Array.isArray(data.groups)) {
          groups = data.groups;
        } else {
          console.warn(
            "Unexpected data structure for user groups:",
            Object.keys(data)
          );
          groups = [];
        }

        // Ensure each group has the expected properties
        const formattedGroups = groups.map((group) => {
          // Make sure we have at least id and name
          return {
            id: group.id || group._id || group.groupId || "unknown",
            name: group.name || group.groupName || group.id || "Unknown Group",
            friendlyName:
              group.friendlyName || group.displayName || group.name || "",
            description: group.description || "",
          };
        });

        // Only cache if we have groups
        if (formattedGroups.length > 0) {
          CacheService.set(cacheKey, formattedGroups, this.USER_GROUPS_TTL);
        }

        return formattedGroups;
      } catch (e) {
        console.error("Error parsing JSON response:", e);

        // Fallback to text parsing
        const responseText = await responseClone.text();

        try {
          const parsedData = JSON.parse(responseText);
          let groups = [];

          if (parsedData.data && Array.isArray(parsedData.data)) {
            groups = parsedData.data;
          } else if (Array.isArray(parsedData)) {
            groups = parsedData;
          } else if (parsedData.groups && Array.isArray(parsedData.groups)) {
            groups = parsedData.groups;
          }

          const formattedGroups = groups.map((group) => ({
            id: group.id || group._id || "unknown",
            name: group.name || "Unknown Group",
            friendlyName: group.friendlyName || group.name || "",
            description: group.description || "",
          }));

          if (formattedGroups.length > 0) {
            CacheService.set(cacheKey, formattedGroups, this.USER_GROUPS_TTL);
          }

          return formattedGroups;
        } catch (jsonError) {
          console.error("Failed to parse response as JSON:", jsonError);
          throw new Error("Invalid API response format");
        }
      }
    } catch (error) {
      console.error(`Error fetching groups for user ${userId}:`, error);

      // Don't cache errors this time - let's try again next time
      return [];
    }
  }
}
