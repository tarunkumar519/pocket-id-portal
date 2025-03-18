import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";

export const load: PageServerLoad = async ({ fetch, cookies }) => {
  try {
    // Prepare headers with API key from environment
    const headers: Record<string, string> = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };

    // Use API key from environment
    if (env.POCKET_ID_API_KEY) {
      headers["X-API-Key"] = env.POCKET_ID_API_KEY;
      console.log("Using API key for authentication");
    }
    // Fallback to token auth if no API key
    else {
      const authCookie = cookies.get("auth_token");

      if (!authCookie) {
        console.error(
          "No auth token found in cookies and no API key available"
        );
        return {
          clients: [],
          status: "error",
          error: "Not authenticated",
        };
      }

      try {
        const authData = JSON.parse(authCookie);
        const accessToken = authData.access_token;

        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
          console.log(`Using access token for authentication`);
        } else {
          console.error("No access token found in auth cookie");
          return {
            clients: [],
            status: "error",
            error: "Invalid auth token",
          };
        }
      } catch (e) {
        console.error("Error parsing auth cookie:", e);
        return {
          clients: [],
          status: "error",
          error: "Invalid auth token format",
        };
      }
    }

    // Make the API request directly from the server
    const apiUrl = `${publicEnv.PUBLIC_OIDC_ISSUER}/api/oidc/clients`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error(
        `API request failed with status ${response.status}: ${response.statusText}`
      );
      return {
        clients: [],
        status: "error",
        error: `API request failed with status ${response.status}`,
      };
    }

    const clientsData = await response.json();

    // Transform client data to include logo URLs and other needed properties
    const clients = {
      ...clientsData,
      data: clientsData.data.map(
        (client: { id: string; isPublic: boolean; hasLogo: boolean }) => ({
          ...client,
          client_id: client.id,
          description: `OAuth2 Client${client.isPublic ? " (Public)" : ""}`,
          icon: client.hasLogo ? null : "📱",
          logoUrl: client.hasLogo
            ? `${publicEnv.PUBLIC_OIDC_ISSUER}/api/oidc/clients/${client.id}/logo`
            : null,
          last_used: new Date().toISOString(),
        })
      ),
    };

    console.log(
      "Clients fetched and transformed successfully:",
      clients.data.length
    );

    return {
      clients,
      status: "success",
    };
  } catch (e) {
    console.error("Error in server load function:", e);
    return {
      clients: [],
      status: "error",
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
};
