import type { PageServerLoad } from "./$types";
import { UserService } from "$lib/services/user-service";
import { OIDCClientService } from "$lib/services/oidc-client-service";
import { ApiKeyService } from "$lib/services/api-key-service";
import type { UserGroup, ApiKey } from "$lib/types";
import type { PocketIdUser } from "$lib/types/pocketid-user.type";

export const load: PageServerLoad = async ({ fetch, cookies }) => {
  try {
    const headers = await OIDCClientService.getAuthHeaders(cookies);
    const userId = UserService.getUserIdFromCookies(cookies);

    let userGroups: UserGroup[] = [];
    let passkeys: any[] = [];
    let apiKeys: ApiKey[] = [];
    let apiKeysPagination = null;
    let error: string | null = null;
    let currentUserInfo: PocketIdUser | null = null;

    if (userId) {
      try {
        userGroups = await UserService.fetchUserGroups(userId, fetch, headers);
        passkeys = await UserService.fetchUserPasskeys(userId, fetch, headers);
        currentUserInfo = await UserService.fetchCurrentUser(fetch, headers);
        console.log("Current user info:", currentUserInfo);

        const apiKeysResponse = await ApiKeyService.fetchApiKeys(
          fetch,
          headers
        );

        if (Array.isArray(apiKeysResponse.data)) {
          apiKeys = apiKeysResponse.data;
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
