<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import { auth } from "$lib/stores/auth.store";
  import { config } from "$lib/stores/portal-config.store";
  import Sidebar from "$lib/components/sidebar.svelte";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import ModeWatcher from "$lib/components/mode-watcher.svelte";
  import { watch } from "runed";

  interface Props {
    children?: import("svelte").Snippet;
  }

  let { children }: Props = $props();

  // Initialize state with SSR-friendly defaults
  let initialized = $state(false);
  let isPublicRoute = $state(false);
  let isAuthenticated = $state(false);

  // Compute sidebar visibility based on route and auth state
  let showSidebar = $derived(!isPublicRoute && isAuthenticated && initialized);

  // Watch for page data changes
  watch(
    [() => $page.data.isPublicRoute],
    ([newValue]) => {
      isPublicRoute = newValue;
    },
    {}
  );

  // Watch for auth changes
  watch(
    [() => $auth.isAuthenticated],
    ([newValue]) => {
      if (browser) {
        isAuthenticated = newValue;
      }
    },
    {}
  );

  // Immediately set initial values
  if ($page.data.isPublicRoute !== undefined) {
    isPublicRoute = $page.data.isPublicRoute;
  }

  if (browser && $auth.isAuthenticated !== undefined) {
    isAuthenticated = $auth.isAuthenticated;
  }

  onMount(() => {
    // Initialize stores only in the browser
    auth.init();
    config.init();

    // Mark as initialized after a small delay to avoid flash
    setTimeout(() => {
      initialized = true;
    }, 50);
  });
</script>

{#if browser}
  <ModeWatcher />
{/if}

<!-- Server-side and initial client render -->
{#if browser && !initialized}
  <!-- Loading state, same for SSR and initial client render -->
  <div class="flex min-h-screen items-center justify-center">
    <div
      class="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
    ></div>
  </div>
{:else if showSidebar}
  <!-- Authenticated layout with sidebar -->
  <div class="flex h-screen">
    <Sidebar />
    <main class="flex-1 overflow-y-auto p-6">
      {@render children?.()}
    </main>
  </div>
{:else if !isPublicRoute && browser && initialized && !isAuthenticated}
  <!-- Unauthenticated but private route - redirect handled elsewhere -->
  <div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
      <div class="mb-4">
        <div
          class="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"
        ></div>
      </div>
      <p class="text-muted-foreground">Checking authentication...</p>
    </div>
  </div>
{:else}
  <!-- Public routes or SSR default state -->
  {@render children?.()}
{/if}
