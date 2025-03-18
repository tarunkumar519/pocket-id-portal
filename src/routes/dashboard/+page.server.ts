import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import type { PageServerData } from "$lib/types";

export const load: PageServerLoad<PageServerData> = async ({
  fetch,
  cookies,
}) => {
  try {
    // Prepare headers with API key from environment
    const headers: Record<string, string> = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };

    let accessToken: string | null = null;
    let userId: string | null = null;

    // First check for the direct user_id cookie - simplest approach
    userId = cookies.get("user_id") || null;
    if (userId) {
      console.log("Found user ID in dedicated cookie:", userId);
    } else {
      console.log("No user_id cookie found, will try other methods");
    }

    // Use API key from environment if available
    if (env.POCKET_ID_API_KEY) {
      headers["X-API-Key"] = env.POCKET_ID_API_KEY;
      console.log("Using API key for authentication");

      // Even with API key, we should try to get the userId if available
      if (!userId && cookies.get("auth_user")) {
        try {
          const userData = JSON.parse(cookies.get("auth_user") || "{}");
          if (userData.sub) {
            userId = userData.sub;
            console.log(
              "Found user ID in auth_user cookie with API key:",
              userId
            );

            // Set a longer-lived user_id cookie for future requests
            cookies.set("user_id", userId, {
              path: "/",
              maxAge: 30 * 24 * 60 * 60, // 30 days
              sameSite: "lax", // Allow cookie to be sent during page navigation
            });
          }
        } catch (err) {
          console.error("Error parsing auth_user cookie:", err);
        }
      }
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
          userGroups: [],
          status: "error",
          error: "Not authenticated",
        };
      }

      try {
        const authData = JSON.parse(authCookie);
        accessToken = authData.access_token;

        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
          console.log(`Using access token for authentication`);

          // If we don't have userId from the direct cookie yet, check auth_user
          if (!userId && cookies.get("auth_user")) {
            try {
              const userData = JSON.parse(cookies.get("auth_user") || "{}");
              if (userData.sub) {
                userId = userData.sub;
                console.log("Found user ID in auth_user cookie:", userId);

                // Set a longer-lived user_id cookie for future requests
                cookies.set("user_id", userId, {
                  path: "/",
                  maxAge: 30 * 24 * 60 * 60, // 30 days
                  sameSite: "lax", // Allow cookie to be sent during page navigation
                });
              }
            } catch (err) {
              console.error("Error parsing auth_user cookie:", err);
            }
          }

          // If we still don't have a userId, fetch it from the userinfo endpoint
          if (!userId) {
            console.log("Fetching user ID from userinfo endpoint");
            try {
              const userInfoResponse = await fetch(
                `${publicEnv.PUBLIC_OIDC_ISSUER}/api/oidc/userinfo`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              if (userInfoResponse.ok) {
                const userInfo = await userInfoResponse.json();
                userId = userInfo.sub;
                console.log("Got user ID from userinfo endpoint:", userId);

                // Store it in cookies for future requests with a longer expiration
                if (userId) {
                  cookies.set("user_id", userId, {
                    path: "/",
                    maxAge: 30 * 24 * 60 * 60, // 30 days
                    sameSite: "lax", // Allow cookie to be sent during page navigation
                  });
                }
              } else {
                console.error(
                  "Failed to fetch userinfo:",
                  userInfoResponse.status
                );
              }
            } catch (fetchErr) {
              console.error("Error fetching userinfo:", fetchErr);
            }
          }
        } else {
          console.error("No access token found in auth cookie");
          return {
            clients: [],
            userGroups: [],
            status: "error",
            error: "Invalid auth token",
          };
        }
      } catch (e) {
        console.error("Error parsing auth cookie:", e);
        return {
          clients: [],
          userGroups: [],
          status: "error",
          error: "Invalid auth token format",
        };
      }
    }

    // Fetch clients first, as we always need them
    const clientsResponse = await fetch(
      `${publicEnv.PUBLIC_OIDC_ISSUER}/api/oidc/clients`,
      {
        method: "GET",
        headers,
      }
    );

    if (!clientsResponse.ok) {
      console.error(
        `Client API request failed with status ${clientsResponse.status}: ${clientsResponse.statusText}`
      );
      return {
        clients: [],
        userGroups: [],
        status: "error",
        error: `API request failed with status ${clientsResponse.status}`,
      };
    }

    const clientsData = await clientsResponse.json();
    let userGroups = [];

    // Only fetch user groups if we have a user ID
    if (userId) {
      try {
        console.log(`Fetching user groups for userId: ${userId}`);
        const userGroupsResponse = await fetch(
          `${publicEnv.PUBLIC_OIDC_ISSUER}/api/users/${userId}/groups`,
          {
            method: "GET",
            headers,
          }
        );

        if (userGroupsResponse.ok) {
          userGroups = await userGroupsResponse.json();
          console.log(
            `Fetched ${userGroups.length} user groups for user ${userId}`
          );
        } else {
          console.warn(
            `Failed to fetch user groups: ${userGroupsResponse.status}`
          );
          // Continue without user groups
        }
      } catch (groupsErr) {
        console.error("Error fetching user groups:", groupsErr);
        // Continue without user groups
      }
    } else if (env.POCKET_ID_API_KEY) {
      // When using API key without userId, we'll show all clients
      console.log("Using API key mode with no user ID - showing all clients");
    } else {
      // If we don't have a userId and not using API key, something's wrong
      console.warn("No user ID available and not using API key");
    }

    // Transform client data
    const clients = {
      data: clientsData.data.map((client: any) => ({
        ...client,
        client_id: client.id,
        description: `OAuth2 Client${client.isPublic ? " (Public)" : ""}`,
        icon: client.hasLogo ? null : "📱",
        logoUrl: client.hasLogo
          ? `${publicEnv.PUBLIC_OIDC_ISSUER}/api/oidc/clients/${client.id}/logo`
          : null,
        last_used: new Date().toISOString(),
      })),
    };

    console.log("Clients fetched successfully:", clients.data.length);

    return {
      clients,
      userGroups,
      status: "success",
    };
  } catch (e) {
    console.error("Error in server load function:", e);
    return {
      clients: [],
      userGroups: [],
      status: "error",
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
};
