import { env } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { CacheService } from "./cache-service";
import type { ApiKey } from "$lib/types";
import { auth } from "$lib/stores/auth.store";
import { get } from "svelte/store";
import { refreshAccessToken } from "$lib/auth";
import { browser } from "$app/environment";
import type { TokenResponse } from "$lib/types";

/**
 * Service for managing API keys
 */
export class ApiKeyService {
  // Cache TTL for API keys (5 minutes)
  private static API_KEYS_TTL = 5 * 60 * 1000;

  /**
   * Get authentication headers using the provided token or from the auth store
   * @param accessToken Optional access token to use directly
   * @returns Authentication headers
   */
  static async getAuthHeaders(
    accessToken?: string
  ): Promise<Record<string, string>> {
    // If an access token is provided, use it
    if (accessToken) {
      return {
        Authorization: `Bearer ${accessToken}`,
      };
    }

    // In the browser, get the token from the auth store
    if (browser) {
      const authState = get(auth);
      let token = authState.tokens?.access_token;

      // If we have a refresh token but not a valid access token, try to refresh
      if (
        !token &&
        authState.tokens?.refresh_token &&
        publicEnv.PUBLIC_OIDC_CLIENT_ID &&
        env.OIDC_CLIENT_SECRET
      ) {
        try {
          const refreshedTokens = await refreshAccessToken(
            authState.tokens.refresh_token,
            publicEnv.PUBLIC_OIDC_CLIENT_ID,
            env.OIDC_CLIENT_SECRET
          );

          // Update the auth store with the new tokens
          if (refreshedTokens && authState.user) {
            auth.setUser(authState.user, refreshedTokens);
          }

          token = refreshedTokens.access_token;
        } catch (error) {
          console.error("Failed to refresh access token:", error);
        }
      }

      if (token) {
        return {
          Authorization: `Bearer ${token}`,
        };
      }
    }

    return {};
  }

  /**
   * Fetch API keys for the authenticated user
   * @param fetch Fetch function to use
   * @param headers Optional pre-defined headers
   * @param accessToken Optional access token to use instead of headers
   * @returns Array of API keys
   */
  static async fetchApiKeys(
    fetch: typeof globalThis.fetch,
    headers?: Record<string, string>,
    accessToken?: string
  ): Promise<{ data: ApiKey[]; pagination?: any }> {
    // Generate cache key
    const cacheKey = `user_api_keys`;

    // Check cache first
    const cachedData = CacheService.get<{ data: ApiKey[]; pagination?: any }>(
      cacheKey
    );
    if (cachedData) {
      return cachedData;
    }

    console.log("Fetching API keys from API");
    const apiUrl = `${publicEnv.PUBLIC_OIDC_ISSUER}/api/api-keys`;

    try {
      // If headers aren't provided or we have an access token, get auth headers
      const authHeaders = headers || (await this.getAuthHeaders(accessToken));

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: authHeaders,
      });

      if (!response.ok) {
        // Error handling code remains the same...
        throw new Error(`Failed to fetch API keys: ${response.status}`);
      }

      // Parse the JSON response
      const responseData = await response.json();

      // Format the API keys consistently - API returns {data: [...]}
      let apiKeys: any[] = [];
      let pagination = null;

      if (responseData.data && Array.isArray(responseData.data)) {
        // Standard response format: { data: [...], pagination: {...} }
        apiKeys = responseData.data;
        pagination = responseData.pagination;
      } else if (Array.isArray(responseData)) {
        // Direct array format
        apiKeys = responseData;
      } else if (
        responseData.api_keys &&
        Array.isArray(responseData.api_keys)
      ) {
        // Legacy format with api_keys property
        apiKeys = responseData.api_keys;
      } else {
        console.warn(
          "Unexpected data structure for API keys:",
          Object.keys(responseData)
        );
        apiKeys = [];
      }

      // Normalize the API key objects to match our expected format
      const formattedApiKeys = apiKeys.map((key: any) => ({
        id: key.id || "unknown",
        name: key.name || "Unnamed API Key",
        prefix: key.prefix || key.key_prefix || "",
        created_at: key.createdAt || key.created_at || new Date().toISOString(),
        last_used: key.lastUsedAt || key.last_used || key.lastUsed,
        expires_at: key.expiresAt || key.expires_at,
        scopes: key.scopes || [],
        description: key.description || "",
      }));

      // Prepare the result with pagination
      const result = {
        data: formattedApiKeys,
        pagination,
      };

      // Cache the results
      if (formattedApiKeys.length > 0) {
        CacheService.set(cacheKey, result, this.API_KEYS_TTL);
      }

      return result;
    } catch (error) {
      console.error("Error fetching API keys:", error);
      // Don't cache errors
      return { data: [] };
    }
  }

  /**
   * Directly fetch API keys using an access token
   * @param accessToken Access token to use
   * @returns Array of API keys
   */
  static async fetchApiKeysWithToken(accessToken: string): Promise<ApiKey[]> {
    return this.fetchApiKeys(fetch, undefined, accessToken).then(
      (result) => result.data
    );
  }
}
