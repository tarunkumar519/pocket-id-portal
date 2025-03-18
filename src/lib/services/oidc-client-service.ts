import { env } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import type { Client, ClientResponse } from "$lib/types/portal.types";

/**
 * Service for interacting with the Pocket ID API
 */
export class OIDCClientService {
  /**
   * Get authentication headers, either from API key or access token
   */
  static async getAuthHeaders(cookies: any): Promise<Record<string, string>> {
    // Base headers
    const headers: Record<string, string> = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };

    // Use API key if available
    if (env.POCKET_ID_API_KEY) {
      headers["X-API-Key"] = env.POCKET_ID_API_KEY;
      console.log("Using API key for authentication");
      return headers;
    }

    // Otherwise, use access token
    const authCookie = cookies.get("auth_token");
    if (!authCookie) {
      throw new Error("No authentication method available");
    }

    try {
      const authData = JSON.parse(authCookie);
      const accessToken = authData.access_token;

      if (!accessToken) {
        throw new Error("Invalid auth token - no access_token found");
      }

      headers["Authorization"] = `Bearer ${accessToken}`;
      console.log("Using access token for authentication");
      return headers;
    } catch (error) {
      throw new Error("Invalid auth token format");
    }
  }

  /**
   * Fetch all available clients from the API
   */
  static async fetchClients(
    fetch: typeof globalThis.fetch,
    headers: Record<string, string>
  ): Promise<ClientResponse> {
    const apiUrl = `${publicEnv.PUBLIC_OIDC_ISSUER}/api/oidc/clients`;

    // Make the API request
    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Get client data
    const clientsData = await response.json();

    // Transform client data
    return {
      ...clientsData,
      data: clientsData.data.map(this.transformClient),
    };
  }

  /**
   * Get detailed information about a specific client
   */
  static async fetchClientDetails(
    clientId: string,
    fetch: typeof globalThis.fetch,
    headers: Record<string, string>
  ): Promise<any> {
    const apiUrl = `${publicEnv.PUBLIC_OIDC_ISSUER}/api/oidc/clients/${clientId}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch client details: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Transform a client object to include additional properties
   */
  static transformClient(client: {
    id: string;
    isPublic: boolean;
    hasLogo: boolean;
    name: string;
  }): Client {
    return {
      ...client,
      client_id: client.id,
      description: `OAuth2 Client${client.isPublic ? " (Public)" : ""}`,
      icon: client.hasLogo ? null : "📱",
      logoUrl: client.hasLogo
        ? `${publicEnv.PUBLIC_OIDC_ISSUER}/api/oidc/clients/${client.id}/logo`
        : null,
      last_used: new Date().toISOString(),
    };
  }

  /**
   * Process clients and add group access information
   */
  static async processClientsWithGroupAccess(
    clientsData: any,
    fetch: typeof globalThis.fetch,
    headers: Record<string, string>,
    userGroups: any[] = []
  ): Promise<Client[]> {
    try {
      // Get details for all clients
      const clientDetailsList: Record<string, any> = {};
      for (const client of clientsData.data) {
        try {
          const clientDetails = await this.fetchClientDetails(
            client.id,
            fetch,
            headers
          );
          clientDetailsList[client.id] = clientDetails;
        } catch (err) {
          console.warn(`Failed to fetch details for client ${client.id}:`, err);
        }
      }

      // Transform clients with group access information
      return clientsData.data
        .map((client: any) => {
          // Base client data with standard transformations
          const transformedClient = this.transformClient(client);

          // Add group information if available
          const clientDetails = clientDetailsList[client.id];

          if (clientDetails?.allowedUserGroups?.length > 0) {
            // Map group objects to their names
            const groupNames = clientDetails.allowedUserGroups.map(
              (group: { id: string; name: string; friendlyName: string }) => {
                return group.friendlyName || group.name;
              }
            );

            transformedClient.accessGroups = groupNames;
            transformedClient.restrictedAccess = true;
          } else {
            transformedClient.accessGroups = ["Everyone"];
            transformedClient.restrictedAccess = false;
          }

          return transformedClient;
        })
        .sort((a: Client, b: Client) => {
          // Sort alphabetically by name
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        });
    } catch (error) {
      console.error("Error processing clients with group access:", error);
      throw error;
    }
  }
}
