// PocketID API Service

class PocketIdService {
  private baseUrl = "/api/proxy";

  // Get user clients with optional custom fetch function
  async getUserClients(customFetch?: typeof fetch): Promise<any[]> {
    try {
      const fetchFn = customFetch || fetch;

      const response = await fetchFn(`${this.baseUrl}/oidc/clients`, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user clients: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user clients:", error);
      throw new Error(
        `Failed to fetch user clients: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Get user groups
  // Get user groups with optional API key
  async getUserGroups(userId: string, apiKey?: string): Promise<any[]> {
    try {
      const headers: Record<string, string> = {
        Accept: "*/*",
        "Content-Type": "application/json",
      };

      // Add API key if provided
      if (apiKey) {
        headers["X-API-Key"] = apiKey;
      }

      const response = await fetch(`${this.baseUrl}/users/${userId}/groups`, {
        method: "GET",
        headers,
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user groups: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user groups:", error);
      throw new Error(
        `Failed to fetch user groups: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Other API methods...
}

export const pocketIdService = new PocketIdService();
