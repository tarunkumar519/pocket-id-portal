import type { PageServerLoad } from "./$types";
import { UserService } from "$lib/services/user-service";
import { OIDCClientService } from "$lib/services/oidc-client-service";
import { CacheService } from "$lib/services/cache-service";

export const load: PageServerLoad = async ({ fetch, cookies }) => {
  try {
    // Get authentication headers
    const headers = await OIDCClientService.getAuthHeaders(cookies);

    // Get user ID from cookies
    const userId = UserService.getUserIdFromCookies(cookies);

    // Default response
    let userGroups = [];
    let passkeys = [];
    let error = null;

    // If we have a user ID, fetch their groups and passkeys
    if (userId) {
      try {
        // Fetch fresh data every time for settings page
        userGroups = await UserService.fetchUserGroups(userId, fetch, headers);
        passkeys = await UserService.fetchUserPasskeys(userId, fetch, headers);
      } catch (err) {
        console.warn("Error fetching user data for settings page:", err);
        error =
          err instanceof Error ? err.message : "Failed to fetch user data";
      }
    } else {
      error = "User ID not found in cookies";
    }

    return {
      userGroups,
      passkeys,
      status: error ? "error" : "success",
      error,
    };
  } catch (error) {
    console.error("Error in settings page server load function:", error);
    return {
      userGroups: [],
      passkeys: [],
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
