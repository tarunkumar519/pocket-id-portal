import type { PageServerLoad } from "./$types";
import { OIDCClientService } from "$lib/services/oidc-client-service";
import { UserService } from "$lib/services/user-service";
import type { PageServerData } from "$lib/types";

/**
 * Server load function for dashboard page
 * Fetches clients and user groups with access information
 */
export const load: PageServerLoad<PageServerData> = async ({
  fetch,
  cookies,
}) => {
  try {
    // Get authentication headers from cookies
    const headers = await OIDCClientService.getAuthHeaders(cookies);

    // Get user ID if available
    const userId = UserService.getUserIdFromCookies(cookies);
    if (!userId) {
      console.warn("No user ID found in cookies");
    }

    // Fetch client data (applications the user has access to) - now with caching
    const clientsData = await OIDCClientService.fetchClients(fetch, headers);

    // Fetch user groups if we have a user ID - now with caching
    let userGroups = [];
    if (userId) {
      try {
        userGroups = await UserService.fetchUserGroups(userId, fetch, headers);
      } catch (error) {
        console.warn("Error fetching user groups:", error);
        // Continue without groups
      }
    }

    // Process clients with group access information
    const processedClients =
      await OIDCClientService.processClientsWithGroupAccess(
        clientsData,
        fetch,
        headers,
        userGroups
      );

    // Add any dashboard-specific data transformations here
    const dashboardClients = processedClients.map((client) => ({
      ...client,
      // Add any dashboard-specific properties here
      dashboardUrl: `/dashboard/apps/${client.client_id}`,
    }));

    return {
      clients: { data: dashboardClients },
      userGroups,
      status: "success",
      error: null,
    };
  } catch (error) {
    console.error("Error in dashboard server load function:", error);
    return {
      clients: { data: [] },
      userGroups: [],
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
