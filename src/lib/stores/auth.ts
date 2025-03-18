import { writable } from "svelte/store";
import type { UserInfo, TokenResponse } from "$lib/types";
import { getAuthState, isAuthenticated } from "$lib/auth";

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
    loading: true,
    initialized: false,
  };

  const { subscribe, set, update } = writable<AuthStore>(initialState);

  return {
    subscribe,
    init: () => {
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
    setUser: (user: UserInfo, tokens: TokenResponse) => {
      set({
        isAuthenticated: true,
        user,
        tokens,
        loading: false,
        initialized: true,
      });
    },
    clearUser: () => {
      set({
        isAuthenticated: false,
        user: null,
        tokens: null,
        loading: false,
        initialized: true,
      });
    },
  };
}

export const auth = createAuthStore();
