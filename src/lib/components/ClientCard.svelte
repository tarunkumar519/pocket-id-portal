<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import { ArrowRight, Lock, LockOpen } from "@lucide/svelte";

  interface Props {
    client: {
      client_id: string;
      name: string;
      description: string;
      hasLogo?: boolean;
      logoUrl?: string | null;
      icon?: string | null;
      logoError?: boolean;
      accessGroups?: string[];
      restrictedAccess?: boolean;
      callback_urls?: string[]; // Added to support callback URLs
    };
    index?: number; // Add index prop for staggered animation
    columns?: number; // Number of columns in the grid
  }

  let {
    client = $bindable(),
    index = $bindable(0),
    columns = $bindable(3),
  }: Props = $props();

  // Handle image error
  function handleImageError() {
    client.logoError = true;
  }

  // Calculate animation delay based on position in grid
  function calculateAnimationDelay(index: number, columns: number): string {
    const row = Math.floor(index / columns);
    const col = index % columns;

    // Combine row and column to get a diagonal wave effect
    // The higher the sum, the later the animation
    const delay = (row + col) * 60; // 60ms per step

    return `${delay}ms`;
  }

  const animationDelay = calculateAnimationDelay(index, columns);

  // Extract base URL from callback URL
  // For example: https://example.test.com/callback -> https://example.test.com
  function getBaseUrl(callbackUrls: string[] | undefined): string {
    // If no callback URLs are available, return a placeholder
    if (!callbackUrls || callbackUrls.length === 0) {
      console.warn(`No callback URLs found for client ${client.name}`);
      return "#"; // Return a hash to prevent navigation
    }

    try {
      // Take the first callback URL
      const callbackUrl = callbackUrls[0];

      // Parse the URL to extract just the origin (protocol + domain + port)
      const url = new URL(callbackUrl);
      return url.origin;
    } catch (error) {
      console.error(`Error parsing callback URL for ${client.name}:`, error);
      // Return a hash to prevent navigation
      return "#";
    }
  }

  // Generate a consistent background gradient based on client name
  function generateGradient(name: string) {
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue1 = hash % 360;
    const hue2 = (hue1 + 40) % 360;
    return `linear-gradient(135deg, hsla(${hue1}, 80%, 80%, 0.6), hsla(${hue2}, 80%, 60%, 0.7))`;
  }

  // Generate a subtle backdrop color for the logo based on client name
  function generateLogoBackdrop(name: string) {
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsla(${hue}, 70%, 97%, 0.8)`;
  }

  // Get the launch URL directly from the client's callback URLs
  let launchUrl = $state(getBaseUrl(client.callback_urls));
</script>

<Card.Root
  class="h-full flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all hover:translate-y-[-2px] duration-300 border bg-card animate-fade-in"
  style="opacity: 0; transform: translateY(10px); animation-delay: {animationDelay}; animation-fill-mode: forwards;"
>
  <!-- Top colored bar with gradient -->
  <div
    class="h-3 w-full"
    style="background: {generateGradient(client.name)};"
  ></div>

  <!-- Content area with reduced minimum height -->
  <div class="flex flex-col p-5 flex-1" style="min-height: 200px;">
    <!-- Logo and App Info with reduced min-height -->
    <div class="flex items-start gap-4 min-h-[90px]">
      <!-- Logo with backdrop (fixed size) -->
      <div
        class="rounded-xl flex-shrink-0 flex items-center justify-center w-14 h-14 p-2 border shadow-sm"
        style="background: {client.hasLogo && !client.logoError
          ? generateLogoBackdrop(client.name)
          : 'var(--primary-50, #f0f9ff)'};
               box-shadow: 0 2px 8px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.5);"
      >
        {#if client.hasLogo && !client.logoError}
          <img
            src={client.logoUrl}
            alt="{client.name} logo"
            class="w-full h-full object-contain"
            loading="lazy"
            onerror={handleImageError}
          />
        {:else}
          <div
            class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg"
          >
            <span class="text-2xl">{client.icon || "📱"}</span>
          </div>
        {/if}
      </div>

      <!-- App Info with minimum height -->
      <div class="flex-1 min-w-0">
        <div class="flex flex-col gap-1">
          <Card.Title class="text-lg font-medium line-clamp-2 break-words">
            {client.name}
          </Card.Title>

          <!-- Access Status - now directly under the title -->
          {#if client.restrictedAccess}
            <Badge
              variant="destructive"
              class="text-xs px-2 py-1 inline-flex items-center gap-1 w-fit"
            >
              <Lock class="w-3 h-3" />
              <span>Restricted</span>
            </Badge>
          {:else}
            <Badge
              variant="secondary"
              class="text-xs px-2 py-1 inline-flex items-center gap-1 text-green-500 w-fit"
            >
              <LockOpen class="w-3 h-3" />
              <span>Unrestricted</span>
            </Badge>
          {/if}

          {#if client.description}
            <p class="text-sm text-muted-foreground line-clamp-2 mt-1">
              {client.description}
            </p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Flex spacer with reduced maximum height -->
    <div class="flex-grow min-h-[10px] max-h-[30px]"></div>

    <!-- Access Controls with reduced height -->
    {#if client.accessGroups && client.accessGroups.length > 0}
      <div class="flex flex-col gap-1 mt-2 h-[50px]">
        <span class="text-xs font-medium text-muted-foreground"
          >Access Group:</span
        >
        <Badge
          variant={client.restrictedAccess ? "destructive" : "secondary"}
          class="text-xs px-2 py-1 flex items-center w-fit"
        >
          {client.accessGroups[0]}
          {#if client.accessGroups.length > 1}
            <span class="ml-1 opacity-75"
              >+{client.accessGroups.length - 1}</span
            >
          {/if}
        </Badge>
      </div>
    {:else}
      <!-- Empty placeholder with reduced height -->
      <div class="h-[50px]"></div>
    {/if}
  </div>

  <!-- Launch Button -->
  <div>
    <Separator />
    <div class="p-3">
      <Button
        variant="default"
        class="w-full rounded-md font-medium"
        href={launchUrl}
        target="_blank"
        rel="noopener noreferrer"
        disabled={launchUrl === "#"}
      >
        <ArrowRight class="w-4 h-4 mr-2" />
        Launch App
      </Button>
    </div>
  </div>
</Card.Root>
