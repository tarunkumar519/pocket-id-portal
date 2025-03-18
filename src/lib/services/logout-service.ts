import { browser } from "$app/environment";
import { auth } from "$lib/stores/auth.store";
import { clearAuthState } from "$lib/auth";
import { env } from "$env/dynamic/public";

/**
 * Service to handle user logout functionality
 */
export class LogoutService {
  /**
   * Preserves specific keys in localStorage during logout
   */
  private static readonly KEYS_TO_PRESERVE = ["user_config"];

  /**
   * Get the base URL for OIDC operations
   */
  private static readonly baseUrl = env.PUBLIC_OIDC_ISSUER;

  /**
   * Performs a complete logout including:
   * - Clearing auth state
   * - Clearing local/session storage (while preserving user preferences)
   * - Clearing cookies
   * - Redirecting to OIDC provider's end session endpoint
   */
  public static async logout(): Promise<void> {
    try {
      // Get the ID token from tokens in the auth store
      const idToken = auth.getIdToken();

      // Save user preferences before logout
      const userConfig = this.preserveUserConfig();

      // Clear local auth state first, but preserve the user ID in cookies
      clearAuthState(true); // Pass true to preserve the user_id cookie

      // Then clear the auth store
      auth.clearUser();

      // Clear browser storage
      this.clearStorage(userConfig);

      // Clear cookies - but not the user_id cookie which is preserved by clearAuthState
      this.clearCookiesExceptUserId();

      // Handle OIDC logout and redirect
      await this.handleOidcLogout(idToken);
    } catch (error) {
      console.error("Error during logout:", error);

      // Fallback logout process
      this.fallbackLogout();
    }
  }

  /**
   * Preserves user configuration from localStorage
   */
  private static preserveUserConfig(): string | null {
    if (!browser) return null;
    return localStorage.getItem("user_config");
  }

  /**
   * Clears localStorage and sessionStorage while preserving specified keys
   */
  private static clearStorage(userConfig: string | null): void {
    if (!browser) return;

    // Clear localStorage selectively
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !this.KEYS_TO_PRESERVE.includes(key)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Restore user config if it existed
    if (userConfig) {
      localStorage.setItem("user_config", userConfig);
    }

    // Clear session storage completely
    sessionStorage.clear();
  }

  /**
   * Clears all cookies except user_id by setting their expiry date to the past
   */
  private static clearCookiesExceptUserId(): void {
    if (!browser) return;

    document.cookie.split(";").forEach((c) => {
      const cookie = c.trim();
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;

      // Skip the user_id cookie
      if (name.trim() !== "user_id") {
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    });
  }

  /**
   * Clears all cookies including user_id (for fallback)
   */
  private static clearAllCookies(): void {
    if (!browser) return;

    document.cookie.split(";").forEach((c) => {
      const cookie = c.trim();
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
  }

  /**
   * Handles OIDC logout by redirecting to the provider's end session endpoint
   */
  private static async handleOidcLogout(idToken: string | null): Promise<void> {
    if (!browser) return;

    if (idToken) {
      // Use standard OIDC end session endpoint with proper post logout redirect
      const origin = window.location.origin;
      const logoutUrl = `${this.baseUrl}/api/oidc/end-session`;
      const redirectUri = `${origin}/login`;

      // Include post_logout_redirect_uri and id_token_hint
      let logoutUrlWithParams = `${logoutUrl}?post_logout_redirect_uri=${encodeURIComponent(
        redirectUri,
      )}`;
      logoutUrlWithParams += `&id_token_hint=${encodeURIComponent(idToken)}`;

      // Redirect to the OIDC provider's logout endpoint
      window.location.href = logoutUrlWithParams;
    } else {
      // No ID token, just redirect to login page
      window.location.href = "/login";
    }
  }

  /**
   * Fallback logout when the normal process fails
   */
  private static fallbackLogout(): void {
    // Save user preferences
    const userConfig = this.preserveUserConfig();

    // Clear auth state directly without preserving user_id
    clearAuthState(false);

    // Clear the auth store
    auth.clearUser();

    // Clear storage
    this.clearStorage(userConfig);

    // Clear all cookies including user_id
    this.clearAllCookies();

    // Redirect to login page
    if (browser) {
      window.location.href = "/login";
    }
  }
}
