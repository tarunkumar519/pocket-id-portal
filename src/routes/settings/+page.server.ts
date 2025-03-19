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

    // Default response with empty user groups
    let userGroups = [];
    let error = null;

    // If we have a user ID, fetch their groups
    if (userId) {
      try {
        // Fetch fresh data every time for settings page
        userGroups = await UserService.fetchUserGroups(userId, fetch, headers);
      } catch (err) {
        console.warn("Error fetching user groups for settings page:", err);
        error =
          err instanceof Error ? err.message : "Failed to fetch user groups";
      }
    } else {
      error = "User ID not found in cookies";
    }

    return {
      userGroups,
      status: error ? "error" : "success",
      error,
    };
  } catch (error) {
    console.error("Error in settings page server load function:", error);
    return {
      userGroups: [],
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
