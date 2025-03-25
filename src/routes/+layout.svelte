<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import { auth } from "$lib/stores/auth.store";
  import { config } from "$lib/stores/portal-config.store";
  import Sidebar from "$lib/components/sidebar.svelte";
  import { onMount } from "svelte";
  import ModeWatcher from "$lib/components/mode-watcher.svelte";

  interface Props {
    children?: import("svelte").Snippet;
  }

  let { children }: Props = $props();

  onMount(() => {
    auth.init();
    config.init();
  });

  let isPublicRoute = $derived($page.data.isPublicRoute);

  let showSidebar = $derived(!isPublicRoute && $auth.isAuthenticated);
</script>

<ModeWatcher />

{#if showSidebar}
  <div class="flex h-screen">
    <Sidebar />
    <main class="flex-1 overflow-y-auto p-6">
      {@render children?.()}
    </main>
  </div>
{:else if !isPublicRoute && !$auth.isAuthenticated}
  <!-- Brief loading state while client-side auth initializes -->
  <div class="flex min-h-screen items-center justify-center">
    <div
      class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
    ></div>
  </div>
{:else}
  {@render children?.()}
{/if}
