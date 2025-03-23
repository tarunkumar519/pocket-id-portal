<script lang="ts">
  import { auth } from "$lib/stores/auth.store";
  import ClientCard from "$lib/components/ClientCard.svelte";
  import * as Pagination from "$lib/components/ui/pagination/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import type { Client, PageServerData, UserGroup } from "$lib/types";
  import { onMount } from "svelte";
  import { Users } from "@lucide/svelte";

  interface Props {
    data: PageServerData;
  }

  let { data }: Props = $props();

  // All data now comes from server
  let userGroups: UserGroup[] = data.userGroups || [];
  const accessibleClients: Client[] = data.clients?.data || [];
  const error = data.status === "error" ? data.error : null;

  // Pagination state
  let itemsPerPage = 9; // 3 rows of 3 cards in desktop view

  // Calculate total items
  let totalItems = $derived(accessibleClients.length);

  // Get current page items based on pagination component's current page
  function getPaginatedClients(currentPage: number) {
    return accessibleClients.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }

  // Default to 3 columns, but we'll update this based on screen size
  let gridColumns = $state(3);

  onMount(() => {
    // Update columns based on screen size
    updateGridColumns();

    // Listen for window resize to update columns
    window.addEventListener("resize", updateGridColumns);

    return () => {
      window.removeEventListener("resize", updateGridColumns);
    };
  });

  function updateGridColumns() {
    // Determine number of columns based on screen width
    if (window.innerWidth >= 1280) {
      gridColumns = 4; // xl screens
    } else if (window.innerWidth >= 1024) {
      gridColumns = 3; // lg screens
    } else if (window.innerWidth >= 768) {
      gridColumns = 2; // md screens
    } else {
      gridColumns = 1; // sm screens
    }
  }
</script>

<svelte:head>
  <title>Dashboard - Pocket ID Portal</title>
</svelte:head>

<!-- Add a container with a max-width to prevent full-width expansion -->
<div class="space-y-6 max-w-[1200px] mx-auto flex flex-col h-full">
  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-bold tracking-tight">My Applications</h1>
    <div class="flex items-center gap-2">
      {#if $auth.user}
        <span class="text-sm text-muted-foreground">
          Welcome, {$auth.user.name || $auth.user.email || "User"}
        </span>
      {/if}
    </div>
  </div>

  {#if error}
    <div class="rounded-lg border bg-card shadow-sm p-6">
      <h3 class="text-lg font-medium text-red-500">
        Error loading applications
      </h3>
      <p class="text-sm text-muted-foreground mt-1">
        {error}
      </p>
      <button
        class="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        onclick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  {:else}
    <div class="rounded-lg border bg-card shadow-sm flex-grow flex flex-col">
      <div class="p-6">
        <h3 class="text-lg font-medium">Applications you can access</h3>
        <p class="text-sm text-muted-foreground mt-1">
          These are the applications you can sign into using your Pocket ID
          account
        </p>
        <!-- Update the groups section in the dashboard to match the settings page style -->
        {#if userGroups.length > 0}
          <div class="mt-3 border rounded-md p-3 bg-muted/10">
            <div class="flex items-center gap-2 mb-2">
              <Users class="h-4 w-4 text-muted-foreground" />
              <span class="text-sm font-medium"
                >Your Groups ({userGroups.length})</span
              >
            </div>
            <div
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
            >
              {#each userGroups as group (group.id)}
                <Badge
                  variant="secondary"
                  class="justify-center py-1.5 px-2 text-xs flex items-center gap-1"
                >
                  <span class="truncate">{group.name}</span>
                </Badge>
              {/each}
            </div>
            {#if userGroups.length > 10}
              <div class="mt-2 text-xs text-muted-foreground">
                Showing {Math.min(10, userGroups.length)} of {userGroups.length}
                groups
              </div>
            {/if}
          </div>
        {:else}
          <div
            class="mt-3 border rounded-md p-3 bg-muted/10 text-muted-foreground flex items-center gap-2"
          >
            <Users class="h-4 w-4" />
            <span class="text-sm">You are not assigned to any groups</span>
          </div>
        {/if}
      </div>
      <div class="p-6 pt-0 flex-grow flex flex-col relative">
        {#if accessibleClients.length === 0}
          <div
            class="flex flex-col items-center justify-center py-8 text-center"
          >
            <div class="rounded-full bg-muted p-3 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-muted-foreground"
              >
                <rect width="8" height="8" x="2" y="2" rx="1"></rect>
                <path d="M6 6h.01"></path>
                <rect width="8" height="8" x="14" y="2" rx="1"></rect>
                <path d="M18 6h.01"></path>
                <rect width="8" height="8" x="2" y="14" rx="1"></rect>
                <path d="M6 18h.01"></path>
                <rect width="8" height="8" x="14" y="14" rx="1"></rect>
                <path d="M18 18h.01"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium">No applications found</h3>
            <p class="text-sm text-muted-foreground mt-1">
              You don't have access to any applications yet. Contact your
              administrator to request access.
            </p>
          </div>
        {:else}
          <div class="flex flex-col h-full pb-16 relative">
            <Pagination.Root count={totalItems} perPage={itemsPerPage}>
              {#snippet children({ pages, currentPage })}
                <div
                  class="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-8 mx-auto max-w-5xl w-full"
                >
                  {#each getPaginatedClients(currentPage) as client, i}
                    <div class="min-h-[180px] min-w-[180px]">
                      <ClientCard {client} index={i} columns={gridColumns} />
                    </div>
                  {/each}
                </div>

                <!-- Only show pagination if we have more than one page -->
                {#if Math.ceil(totalItems / itemsPerPage) > 1}
                  <div
                    class="absolute bottom-0 left-0 right-0 py-2 flex justify-center"
                  >
                    <Pagination.Content>
                      <Pagination.Item>
                        <Pagination.PrevButton />
                      </Pagination.Item>

                      {#each pages as page (page.key)}
                        {#if page.type === "ellipsis"}
                          <Pagination.Item>
                            <Pagination.Ellipsis />
                          </Pagination.Item>
                        {:else}
                          <Pagination.Item>
                            <Pagination.Link
                              {page}
                              isActive={currentPage === page.value}
                            >
                              {page.value}
                            </Pagination.Link>
                          </Pagination.Item>
                        {/if}
                      {/each}

                      <Pagination.Item>
                        <Pagination.NextButton />
                      </Pagination.Item>
                    </Pagination.Content>
                  </div>
                {/if}
              {/snippet}
            </Pagination.Root>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
