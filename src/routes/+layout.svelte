<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/stores/auth";
  import { config } from "$lib/stores/portal-config.store";
  import Sidebar from "$lib/components/sidebar.svelte";
  import { browser } from "$app/environment";
  import ModeWatcher from "$lib/components/mode-watcher.svelte";

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/callback", "/forgot-password"];

  // Check if current route is public
  $: isPublicRoute = publicRoutes.some(
    (route) =>
      $page.url.pathname === route || $page.url.pathname.startsWith(route + "/")
  );

  // Initialize auth and config on mount
  onMount(() => {
    auth.init();
    config.init();

    // Immediately check auth status for non-public routes
    if (browser && !isPublicRoute) {
      checkAuthAndRedirect();
    }
  });

  // Function to check auth and redirect if needed
  function checkAuthAndRedirect() {
    if (!isPublicRoute && !$auth.isAuthenticated && $auth.initialized) {
      console.log("Not authenticated, redirecting to login");
      goto("/login", { replaceState: true });
    } else if (
      $auth.isAuthenticated &&
      $page.url.pathname === "/" &&
      $config.landingPage === "applications"
    ) {
      // Redirect to applications page if that's the preferred landing page
      goto("/applications", { replaceState: true });
    }
  }

  // Watch for auth store changes and URL changes
  $: if ($auth.initialized && $page.url) {
    checkAuthAndRedirect();
  }

  // Check if we should show the sidebar
  $: showSidebar = !isPublicRoute && $auth.isAuthenticated;
</script>

<ModeWatcher />

{#if showSidebar}
  <div class="flex h-screen">
    <Sidebar />
    <main class="flex-1 overflow-y-auto p-6">
      <slot />
    </main>
  </div>
{:else if !isPublicRoute && !$auth.isAuthenticated && $auth.initialized}
  <!-- Show a loading state while redirecting -->
  <div class="flex min-h-screen items-center justify-center">
    <div
      class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
    ></div>
  </div>
{:else}
  <slot />
{/if}
