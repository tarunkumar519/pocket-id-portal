import { writable, get } from "svelte/store";
import type { UserInfo, TokenResponse } from "$lib/types";
import { getAuthState, isAuthenticated } from "$lib/auth";
import { browser } from "$app/environment";

// Define the auth store type
type AuthStore = {
  isAuthenticated: boolean;
  user: UserInfo | null;
  tokens: TokenResponse | null;
  loading: boolean;
  initialized: boolean;
};

// Initialize the store with values from localStorage if available
function createAuthStore() {
  // Initial state with loading true and initialized false
  const initialState: AuthStore = {
    isAuthenticated: false,
    user: null,
    tokens: null,
    loading: !browser, // Only show loading on client-side
    initialized: !browser, // Consider SSR as already initialized
  };

  const { subscribe, set, update } = writable<AuthStore>(initialState);

  // Keep track of the current state
  let currentState = initialState;

  // Subscribe to our own store to keep the current state updated
  subscribe((state) => {
    currentState = state;
  });

  return {
    subscribe,
    init: () => {
      // Skip initialization on server
      if (!browser) return;

      update((state) => ({ ...state, loading: true }));

      try {
        // Get initial state from localStorage
        const { tokens, userInfo, authTime } = getAuthState();

        // Check if the stored tokens are valid
        const authenticated = isAuthenticated();

        set({
          isAuthenticated: authenticated,
          user: authenticated ? userInfo : null,
          tokens: authenticated ? tokens : null,
          loading: false,
          initialized: true,
        });
      } catch (error) {
        console.error("Error initializing auth store:", error);
        set({
          isAuthenticated: false,
          user: null,
          tokens: null,
          loading: false,
          initialized: true,
        });
      }
    },
    // Server-side initialization with provided user and tokens
    serverInit: (user: UserInfo | null, tokens: TokenResponse | null) => {
      // This method is meant to be called from hooks.server.ts or similar
      set({
        isAuthenticated: !!user && !!tokens,
        user,
        tokens,
        loading: false,
        initialized: true,
      });
    },
    setUser: (user: UserInfo, tokens: TokenResponse) => {
      // Only try to set cookies if we're in the browser
      if (browser && user?.sub) {
        // Use a longer expiration time for the user_id cookie (30 days)
        const longMaxAge = 30 * 24 * 60 * 60; // 30 days in seconds
        const domain = window.location.hostname;

        // Store userId in a dedicated cookie with domain for server-side access
        document.cookie = `user_id=${user.sub}; path=/; max-age=${longMaxAge}; domain=${domain}; SameSite=Lax; secure`;
        console.log(
          `Set user_id cookie with domain ${domain} and 30-day expiration:`,
          user.sub
        );

        // Standard token expiration for the other cookies
        const tokenMaxAge =
          typeof tokens.expires_in === "number" && !isNaN(tokens.expires_in)
            ? tokens.expires_in
            : 3600; // Default to 1 hour

        // Also store the user data in auth_user cookie
        document.cookie = `auth_user=${JSON.stringify(
          user
        )}; path=/; max-age=${tokenMaxAge}; domain=${domain}; SameSite=Lax; secure`;
        document.cookie = `auth_token=${JSON.stringify(
          tokens
        )}; path=/; max-age=${tokenMaxAge}; domain=${domain}; SameSite=Lax; secure`;
      }

      set({
        isAuthenticated: true,
        user,
        tokens,
        loading: false,
        initialized: true,
      });
    },
    clearUser: () => {
      // Only try to clear cookies if we're in the browser
      if (browser) {
        const domain = window.location.hostname;
        document.cookie = `user_id=; path=/; max-age=0; domain=${domain}; SameSite=Lax; secure`;
        document.cookie = `auth_user=; path=/; max-age=0; domain=${domain}; SameSite=Lax; secure`;
        document.cookie = `auth_token=; path=/; max-age=0; domain=${domain}; SameSite=Lax; secure`;
      }

      set({
        isAuthenticated: false,
        user: null,
        tokens: null,
        loading: false,
        initialized: true,
      });
    },
    getIdToken: (): string | null => {
      // Use the current state to get the ID token
      return currentState.tokens?.id_token || null;
    },
    getUserId: (): string | null => {
      // Get userId from the current state
      return currentState.user?.sub || null;
    },
    // Get the current state (useful for server-side operations)
    getState: () => currentState,
  };
}

export const auth = createAuthStore();
