<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/stores/auth.store";
  import { browser } from "$app/environment";
  import { watch } from "runed";

  interface Props {
    requiredRole?: string | null;
    children?: import("svelte").Snippet;
  }

  let { requiredRole = null, children }: Props = $props();

  let isAuthorized = $state(false);
  let isLoading = $state(true);

  // Initialize auth state if needed and check authorization immediately
  if (!$auth.initialized && browser) {
    auth.init();
  } else {
    checkAuthorization();
  }

  function checkAuthorization() {
    isLoading = true;

    // Check if user is authenticated
    if (!$auth.isAuthenticated) {
      if (browser) {
        // Only redirect on client-side
        const currentPath = window.location.pathname;
        goto(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
      }
      return;
    }

    // If a specific role is required, check if user has that role
    if (requiredRole) {
      // Check if the user has the role from their auth data
      const userRoles = ($auth.user as any)?.roles || [];
      const userGroups = ($auth.user as any)?.groups || [];

      isAuthorized =
        userRoles.includes(requiredRole) || userGroups.includes(requiredRole);
    } else {
      // If no specific role is required, just being authenticated is enough
      isAuthorized = true;
    }

    isLoading = false;
  }

  // Watch for changes in auth state
  watch(
    () => [$auth.initialized, $auth.isAuthenticated, $auth.user],
    ([initialized]) => {
      if (initialized) {
        checkAuthorization();
      }
    }
  );
</script>

{#if isLoading}
  <div class="flex items-center justify-center h-full">
    <div
      class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
    ></div>
  </div>
{:else if isAuthorized}
  {@render children?.()}
{:else}
  <div class="flex flex-col items-center justify-center h-full">
    <h2 class="text-xl font-bold">Not Authorized</h2>
    <p class="text-muted-foreground">
      You don't have permission to access this page.
    </p>
  </div>
{/if}
