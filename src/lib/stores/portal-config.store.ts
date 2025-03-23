import { writable } from "svelte/store";
import { browser } from "$app/environment";

// Define the user config type
export type UserConfig = {
  theme: "light" | "dark" | "system";
  landingPage: "dashboard" | "settings" | "profile";
};

// Default configuration
const defaultConfig: UserConfig = {
  theme: "system",
  landingPage: "dashboard",
};

// Create the store
function createConfigStore() {
  // Get initial state from localStorage if available
  const initialConfig = browser
    ? JSON.parse(localStorage.getItem("user_config") || "null") || defaultConfig
    : defaultConfig;

  const { subscribe, set, update } = writable<UserConfig>(initialConfig);

  return {
    subscribe,

    setTheme: (theme: UserConfig["theme"]) => {
      update((config) => {
        const newConfig = { ...config, theme };

        // Save to localStorage
        if (browser) {
          localStorage.setItem("user_config", JSON.stringify(newConfig));
        }

        // Apply theme to document
        applyTheme(theme);

        return newConfig;
      });
    },

    setLandingPage: (landingPage: UserConfig["landingPage"]) => {
      update((config) => {
        const newConfig = { ...config, landingPage };

        // Save to localStorage
        if (browser) {
          localStorage.setItem("user_config", JSON.stringify(newConfig));
        }

        return newConfig;
      });
    },

    // Initialize config on app startup
    init: () => {
      // We've already loaded from localStorage during store creation
      // Just need to apply the theme
      if (browser && initialConfig.theme) {
        applyTheme(initialConfig.theme);
      }
    },
  };
}

// Helper function to apply theme
function applyTheme(theme: UserConfig["theme"]) {
  if (!browser) return;

  // Remove existing theme class
  document.documentElement.classList.remove("light", "dark");

  // Apply new theme
  if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    document.documentElement.classList.add(prefersDark ? "dark" : "light");
  } else {
    document.documentElement.classList.add(theme);
  }
}

export const config = createConfigStore();
