import type { PageServerLoad } from "./$types";
import { UserService } from "$lib/services/user-service";
import { OIDCClientService } from "$lib/services/oidc-client-service";
import { ApiKeyService } from "$lib/services/api-key-service";
import type { UserGroup, ApiKey } from "$lib/types";

export const load: PageServerLoad = async ({ fetch, cookies }) => {
  try {
    // Get authentication headers
    const headers = await OIDCClientService.getAuthHeaders(cookies);

    // Get user ID from cookies
    const userId = UserService.getUserIdFromCookies(cookies);

    // Default response
    let userGroups: UserGroup[] = [];
    let passkeys: any[] = [];
    let apiKeys: ApiKey[] = [];
    let apiKeysPagination = null;
    let error: string | null = null;
    let currentUserInfo: PocketIdUser | null = null;

    // If we have a user ID, fetch the user data
    if (userId) {
      try {
        // Fetch fresh data every time for profile page
        userGroups = await UserService.fetchUserGroups(userId, fetch, headers);
        passkeys = await UserService.fetchUserPasskeys(userId, fetch, headers);
        currentUserInfo = await UserService.fetchCurrentUser(fetch, headers);

        // Fetch API keys and extract pagination data
        const apiKeysResponse = await ApiKeyService.fetchApiKeys(
          fetch,
          headers
        );

        if (apiKeysResponse.data && Array.isArray(apiKeysResponse.data)) {
          apiKeys = apiKeysResponse.data;

          // Extract pagination data if present
          if (apiKeysResponse.pagination) {
            apiKeysPagination = apiKeysResponse.pagination;
          }
        } else {
          apiKeys = apiKeysResponse.data || [];
        }
      } catch (err) {
        console.warn("Error fetching user data for profile page:", err);
        error =
          err instanceof Error ? err.message : "Failed to fetch user data";
      }
    } else {
      error = "User ID not found in cookies";
    }

    return {
      userGroups,
      passkeys,
      apiKeys,
      apiKeysPagination,
      status: error ? "error" : "success",
      error,
      currentUserInfo,
    };
  } catch (error) {
    console.error("Error in profile page server load function:", error);
    return {
      userGroups: [],
      passkeys: [],
      apiKeys: [],
      apiKeysPagination: null,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
