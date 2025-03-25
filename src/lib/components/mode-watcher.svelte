<script lang="ts">
  import { onMount } from "svelte";
  import { config } from "$lib/stores/portal-config.store";
  import { browser } from "$app/environment";

  let themeChangeObserver: MutationObserver | undefined;

  // Watch for theme changes
  function setupThemeWatcher() {
    // Apply initial theme
    const theme = $config.theme;
    applyTheme(theme);

    // Watch for system preference changes if theme is set to 'system'
    if (browser) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", () => {
        if ($config.theme === "system") {
          applyTheme("system");
        }
      });
    }
  }

  // Apply theme to document
  function applyTheme(theme: string) {
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

  onMount(() => {
    setupThemeWatcher();

    // Cleanup
    return () => {
      if (themeChangeObserver) {
        themeChangeObserver.disconnect();
      }
    };
  });

  // Update when config changes
  $effect(() => {
    if (browser && $config) {
      applyTheme($config.theme);
    }
  });
</script>
