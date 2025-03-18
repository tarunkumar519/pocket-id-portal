<script lang="ts">
  import { browser } from "$app/environment";
  import { env } from "$env/dynamic/public";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";

  export let client: {
    client_id: string;
    name: string;
    description: string;
    hasLogo?: boolean;
    logoUrl?: string | null;
    icon?: string | null;
    logoError?: boolean;
    accessGroups?: string[];
    restrictedAccess?: boolean;
  };

  // Handle image error
  function handleImageError() {
    client.logoError = true;
  }

  // Create redirect URL safely using environment variables
  function getRedirectUrl(clientId: string) {
    const baseUrl = env.PUBLIC_OIDC_AUTH_ENDPOINT;
    const redirectUri = browser
      ? encodeURIComponent(window.location.origin + "/callback")
      : encodeURIComponent(`${env.PUBLIC_OIDC_ISSUER}/callback`);
    return `${baseUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(env.PUBLIC_OIDC_SCOPES)}`;
  }
</script>

<Card.Root class="h-full hover:shadow-md transition-shadow flex flex-col p-3">
  <Card.Header class="flex flex-col items-center justify-center space-y-2 pb-2">
    <div class="text-2xl">
      {#if client.hasLogo && !client.logoError}
        <div
          class="bg-gray-100 dark:bg-gray-800 p-2 rounded-md flex items-center justify-center w-16 h-16"
        >
          <img
            src={client.logoUrl}
            alt="{client.name} logo"
            class="w-12 h-12 object-contain"
            on:error={handleImageError}
          />
        </div>
      {:else}
        <div
          class="bg-gray-100 dark:bg-gray-800 p-2 rounded-md flex items-center justify-center w-16 h-16"
        >
          {client.icon || "📱"}
        </div>
      {/if}
    </div>

    <Card.Title class="text-lg text-center">{client.name}</Card.Title>

    <!-- Access Group Badge -->
    {#if client.accessGroups && client.accessGroups.length > 0}
      <div class="flex flex-wrap justify-center gap-1">
        {#each client.accessGroups.slice(0, 1) as group}
          <Badge
            class={`text-xs border ${
              client.restrictedAccess
                ? "border-destructive text-destructive bg-destructive/10"
                : "border-success text-success bg-success/10"
            }`}
          >
            {group}
            {#if client.accessGroups.length > 1}
              +{client.accessGroups.length - 1}
            {/if}
          </Badge>
        {/each}
      </div>
    {/if}
  </Card.Header>

  <Card.Footer class="mt-auto pt-2">
    <a
      href={getRedirectUrl(client.client_id)}
      class="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-full"
    >
      Launch
    </a>
  </Card.Footer>
</Card.Root>
