<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import type { ApiKey } from "$lib/types";
  import { KeyRound, Clock, AlertCircle } from "@lucide/svelte";
  import * as Pagination from "$lib/components/ui/pagination";
  import { watch } from "runed";

  interface PaginationData {
    totalPages: number;
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
  }

  interface Props {
    apiKeys: ApiKey[];
    isLoading: boolean;
    error: string | null;
    pagination?: PaginationData;
    itemsPerPage?: number;
  }

  let {
    apiKeys = $bindable([]),
    isLoading = $bindable(false),
    error = $bindable(null),
    pagination = $bindable(undefined),
    itemsPerPage = $bindable(5), // Default to 5 items per page
  }: Props = $props();

  // Set up pagination state
  let currentPage = $state(pagination?.currentPage || 1);
  let totalItems = $derived(apiKeys.length);
  let totalPages = $derived(
    pagination?.totalPages || Math.ceil(totalItems / itemsPerPage)
  );

  let paginatedApiKeys = $state<ApiKey[]>(
    pagination ? apiKeys : getPaginatedItems()
  );

  watch(
    () => [apiKeys, pagination, currentPage, itemsPerPage],
    () => {
      // If pagination data is provided, we assume the items are already paginated from the API
      // Otherwise, we'll paginate locally
      if (!pagination) {
        paginatedApiKeys = getPaginatedItems();
      }
    }
  );

  // Function to handle page changes
  function handlePageChange(newPage: number) {
    currentPage = newPage;
    if (!pagination) {
      // Only do local pagination if we don't have server pagination data
      paginatedApiKeys = getPaginatedItems();
    }
  }

  // Function to get items for the current page
  function getPaginatedItems(): ApiKey[] {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return apiKeys.slice(start, end);
  }

  // Helper function to format date
  function formatDate(dateString: string | undefined): string {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Helper function to check if key is expired
  function isExpired(expiresAt: string | undefined): boolean {
    if (!expiresAt) return false;
    const now = new Date();
    const expiry = new Date(expiresAt);
    return expiry < now;
  }

  // Helper function to check if key is expiring soon (within 7 days)
  function isExpiringSoon(expiresAt: string | undefined): boolean {
    if (!expiresAt) return false;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return expiry > now && expiry < sevenDaysFromNow;
  }
</script>

<div class="flex items-center justify-between mb-6">
  <div class="flex items-center gap-2">
    <div class="bg-primary/5 p-1 rounded-md">
      <KeyRound class="h-4 w-4 text-primary" />
    </div>
    <h3 class="font-medium">Your API Keys</h3>
  </div>
  <div class="bg-muted text-xs font-semibold rounded-full px-2 py-0.5">
    {totalItems}
  </div>
</div>

{#if isLoading}
  <div
    class="flex items-center justify-center h-24 bg-muted/5 rounded-lg border border-dashed"
  >
    <p class="text-sm text-muted-foreground">Loading API keys...</p>
  </div>
{:else if error}
  <div class="bg-destructive/5 p-4 rounded-lg border border-destructive/20">
    <p class="text-sm text-destructive">Error: {error}</p>
    <p class="text-xs text-muted-foreground mt-2">
      Unable to load your API keys. You can still manage them directly in Pocket
      ID.
    </p>
  </div>
{:else if apiKeys.length === 0}
  <div class="bg-muted/10 p-4 rounded-lg border">
    <p class="text-sm">
      You don't have any API keys. API keys allow you to interact with Pocket ID
      programmatically for automation and integrations.
    </p>
  </div>
{:else}
  <div class="space-y-4">
    <div class="space-y-3">
      {#each pagination ? apiKeys : paginatedApiKeys as key, i (key.id)}
        <div
          class="p-4 rounded-lg border hover:border-primary/50 transition-all animate-fade-in opacity-0 group"
          style="
        background-color: {isExpired(key.expires_at)
            ? 'var(--destructive-50)'
            : isExpiringSoon(key.expires_at)
              ? 'var(--warning-50)'
              : 'var(--muted-50)'};
        animation-delay: {200 + i * 75}ms;
      "
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div class="flex items-start gap-3">
              <div class="bg-primary/10 p-2 rounded-full mt-1">
                <KeyRound class="h-4 w-4 text-primary" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="font-medium text-sm">{key.name}</p>
                  {#if isExpired(key.expires_at)}
                    <Badge
                      variant="outline"
                      class="bg-destructive/10 text-destructive text-xs"
                    >
                      <AlertCircle class="h-3 w-3 mr-1" />
                      Expired
                    </Badge>
                  {:else if isExpiringSoon(key.expires_at)}
                    <Badge
                      variant="outline"
                      class="bg-amber-100 text-amber-700 text-xs"
                    >
                      <Clock class="h-3 w-3 mr-1" />
                      Expiring soon
                    </Badge>
                  {/if}
                </div>

                {#if key.scopes && key.scopes.length > 0}
                  <div class="flex flex-wrap gap-1 mt-1.5">
                    {#each key.scopes as scope}
                      <Badge
                        variant="outline"
                        class="text-[10px] py-0 px-1 h-4 bg-primary/5"
                      >
                        {scope}
                      </Badge>
                    {/each}
                  </div>
                {/if}

                <div
                  class="flex items-center gap-2 mt-2 text-xs text-muted-foreground"
                >
                  <span class="font-mono bg-muted/30 px-1.5 py-0.5 rounded">
                    {key.prefix}•••••••••
                  </span>
                </div>
              </div>
            </div>
            <div
              class="flex flex-col gap-1 items-end text-xs text-muted-foreground mt-2 sm:mt-0"
            >
              <div class="flex items-center gap-1">
                <Clock class="h-3 w-3" />
                <span>Created: {formatDate(key.created_at)}</span>
              </div>

              {#if key.last_used}
                <div>Last used: {formatDate(key.last_used)}</div>
              {/if}

              {#if key.expires_at}
                <div>Expires: {formatDate(key.expires_at)}</div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Add pagination component if we have more than 5 items -->
    {#if totalItems > itemsPerPage}
      <div class="mt-6 flex justify-center">
        <Pagination.Root
          count={totalItems}
          perPage={itemsPerPage}
          page={currentPage}
          onPageChange={handlePageChange}
        >
          {#snippet children({ pages, currentPage })}
            <div
              class="bg-background/80 backdrop-blur-sm px-4 py-1.5 rounded-full border shadow-sm"
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
          {/snippet}
        </Pagination.Root>
      </div>
    {/if}
  </div>
{/if}
