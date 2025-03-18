<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import ClientCard from "$lib/components/ClientCard.svelte";
  import * as Pagination from "$lib/components/ui/pagination/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import type { Client, PageServerData, UserGroup } from "$lib/types";

  // Get data from the server load function - now includes filtered clients and user groups
  export let data: PageServerData;

  // All data now comes from server
  let userGroups: UserGroup[] = data.userGroups || [];
  const accessibleClients: Client[] = data.clients?.data || [];
  const error = data.status === "error" ? data.error : null;

  // Pagination state
  let itemsPerPage = 9; // 3 rows of 3 cards in desktop view

  // Calculate total items
  $: totalItems = accessibleClients.length;

  // Get current page items based on pagination component's current page
  function getPaginatedClients(currentPage: number) {
    return accessibleClients.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
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
        on:click={() => window.location.reload()}
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
        {#if userGroups.length > 0}
          <div class="mt-2 flex flex-wrap gap-2">
            <span class="text-xs text-muted-foreground">Your groups:</span>
            {#each userGroups as group}
              <Badge variant="secondary" class="text-xs">{group.name}</Badge>
            {/each}
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
                  {#each getPaginatedClients(currentPage) as client}
                    <div class="min-h-[180px] min-w-[180px]">
                      <ClientCard {client} />
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
