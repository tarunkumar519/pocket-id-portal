<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/stores/auth";

  export let requiredRole: string | null = null;

  let isAuthorized = false;
  let isLoading = true;

  onMount(() => {
    checkAuthorization();
  });

  function checkAuthorization() {
    isLoading = true;

    // Check if user is authenticated
    if (!$auth.isAuthenticated) {
      goto("/login");
      return;
    }

    // If a specific role is required, check if user has that role
    if (requiredRole) {
      // In a real app, you would check the user's roles
      // For now, we'll assume all authenticated users have the required role
      isAuthorized = true;
    } else {
      // If no specific role is required, just being authenticated is enough
      isAuthorized = true;
    }

    isLoading = false;
  }

  // Re-check authorization when auth state changes
  $: if ($auth) checkAuthorization();
</script>

{#if isLoading}
  <div class="flex items-center justify-center h-full">
    <div
      class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
    ></div>
  </div>
{:else if isAuthorized}
  <slot />
{:else}
  <div class="flex flex-col items-center justify-center h-full">
    <h2 class="text-xl font-bold">Not Authorized</h2>
    <p class="text-muted-foreground">
      You don't have permission to access this page.
    </p>
  </div>
{/if}
