import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { PageServerData } from "$lib/types";
import { OIDCClientService } from "$lib/services/oidc-client-service";
import { UserService } from "$lib/services/user-service";
import { config } from "$lib/stores/portal-config.store";

export const load: PageServerLoad<PageServerData> = async ({
  fetch,
  cookies,
  url,
  locals,
}) => {
  // Handle root path redirects based on authentication status
  if (url.pathname === "/") {
    if (locals.isAuthenticated) {
      const preferredLandingPage =
        cookies.get("portal_landing_page") || "dashboard";
      throw redirect(302, `/${preferredLandingPage}`);
    }
    throw redirect(302, "/login");
  }

  try {
    const headers = await OIDCClientService.getAuthHeaders(cookies);
    const userId = UserService.getUserIdFromCookies(cookies);

    const clientsData = await OIDCClientService.fetchClients(fetch, headers);

    let userGroups: any[] = [];
    if (userId) {
      try {
        userGroups = await UserService.fetchUserGroups(userId, fetch, headers);
      } catch (error) {
        console.warn("Error fetching user groups:", error);
      }
    }

    const processedClients =
      await OIDCClientService.processClientsWithGroupAccess(
        clientsData,
        fetch,
        headers,
        userGroups
      );

    return {
      clients: { data: processedClients },
      userGroups,
      status: "success",
      error: null,
    };
  } catch (error) {
    console.error("Error in server load function:", error);
    return {
      clients: { data: [] },
      userGroups: [],
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
