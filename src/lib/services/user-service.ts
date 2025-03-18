import { env as publicEnv } from "$env/dynamic/public";

export class UserService {
  /**
   * Fetch user groups for a specific user
   */
  static async fetchUserGroups(
    userId: string,
    fetch: typeof globalThis.fetch,
    headers: Record<string, string>
  ): Promise<any[]> {
    const apiUrl = `${publicEnv.PUBLIC_OIDC_ISSUER}/api/users/${userId}/groups`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user groups: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get user ID from cookies or auth data
   */
  static getUserIdFromCookies(cookies: any): string | null {
    // First check for the direct user_id cookie
    const userId = cookies.get("user_id");
    if (userId) {
      return userId;
    }

    // Try to get it from auth_user cookie
    try {
      const authUserCookie = cookies.get("auth_user");
      if (authUserCookie) {
        const userData = JSON.parse(authUserCookie);
        return userData.sub || null;
      }
    } catch (err) {
      console.error("Error parsing auth_user cookie:", err);
    }

    return null;
  }
}
