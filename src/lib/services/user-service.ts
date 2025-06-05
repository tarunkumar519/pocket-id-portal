import { env } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import type { UserGroup } from "$lib/types";
import type { PocketIdUser } from "$lib/types/pocketid-user.type";
import { CacheService } from "./cache-service";

/**
 * Service for managing user-related operations
 */
export class UserService {
  // Cache TTL for user groups (10 minutes)
  private static USER_GROUPS_TTL = 10 * 60 * 1000;
  private static PASSKEYS_TTL = 5 * 60 * 1000; // 5 minutes cache for passkeys

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
        const formattedGroups = groups.map((group: UserGroup) => ({
          id: group.id || "unknown",
          name: group.name || "Unknown Group",
          description: group.description || "",
        }));

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

          const formattedGroups = groups.map((group: UserGroup) => ({
            id: group.id || "unknown",
            name: group.name || "Unknown Group",
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

  /**
   * Fetch the current user's info (including isAdmin)
   */
  static async fetchCurrentUser(
    fetch: typeof globalThis.fetch,
    headers: Record<string, string>
  ): Promise<PocketIdUser> {
    const cacheKey = `current_user_info`;
    const apiUrl = `${publicEnv.PUBLIC_OIDC_ISSUER}/api/users/me`;

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        console.error(
          `API returned status ${response.status} for /api/users/me`
        );
        throw new Error(
          `Failed to fetch current user info: ${response.status}`
        );
      }

      const data = await response.json();

      // Map API response to PocketIdUser type
      const user: PocketIdUser = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        isAdmin: data.isAdmin,
        userGroups: data.userGroups || [],
        ldapId: data.ldapId || "",
        locale: data.locale || "en",
        customClaims: data.customClaims || {},
        // Add any other required fields from PocketIdUser here
      };

      // Optionally cache the result
      // CacheService.set(cacheKey, user, 5 * 60 * 1000);

      return user;
    } catch (error) {
      console.error("Error fetching current user info:", error);
      throw error;
    }
  }

  /**
   * Fetch passkeys for a specific user
   */
  static async fetchUserPasskeys(
    userId: string,
    fetch: typeof globalThis.fetch,
    headers: Record<string, string>
  ): Promise<any[]> {
    // Generate cache key
    const cacheKey = `user_passkeys_${userId}`;

    // Check cache first
    const cachedData = CacheService.get<any[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    console.log(`Fetching passkeys for user ${userId} from API`);
    const apiUrl = `${publicEnv.PUBLIC_OIDC_ISSUER}/api/webauthn/credentials`;

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        console.error(`API returned status ${response.status} for passkeys`);

        if (response.status === 429) {
          // Rate limited - try again with delay
          console.log("Rate limited, trying once more with delay");
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return this.fetchUserPasskeys(userId, fetch, headers);
        }

        throw new Error(`Failed to fetch passkeys: ${response.status}`);
      }

      // Parse the JSON response
      const data = await response.json();

      // Format the passkeys consistently
      let passkeys = [];

      if (Array.isArray(data)) {
        passkeys = data;
      } else if (data.credentials && Array.isArray(data.credentials)) {
        passkeys = data.credentials;
      } else if (data.passkeys && Array.isArray(data.passkeys)) {
        passkeys = data.passkeys;
      } else {
        console.warn(
          "Unexpected data structure for passkeys:",
          Object.keys(data)
        );
        passkeys = [];
      }

      // Normalize the passkey objects
      const formattedPasskeys = passkeys.map((passkey: any) => ({
        id: passkey.id || passkey.credential_id || "unknown",
        name: passkey.name || "Unnamed Passkey",
        created_at:
          passkey.created_at || passkey.createdAt || new Date().toISOString(),
        device: passkey.device || passkey.deviceType || "Unknown Device",
      }));

      // Cache the results
      if (formattedPasskeys.length > 0) {
        CacheService.set(cacheKey, formattedPasskeys, this.PASSKEYS_TTL);
      }

      return formattedPasskeys;
    } catch (error) {
      console.error(`Error fetching passkeys for user ${userId}:`, error);
      // Don't cache errors
      return [];
    }
  }
}
