<script lang="ts">
  import { auth } from "$lib/stores/auth.store";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { env } from "$env/dynamic/public";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Users,
    User,
    Shield,
    Key,
    KeyRound,
    Clock,
    AlertCircle,
  } from "@lucide/svelte";
  import type { UserGroup, ApiKey } from "$lib/types";
  import HeroHeader from "$lib/components/hero-header.svelte";
  import ApiKeysList from "$lib/components/api-key-list.svelte";
  import type { PocketIdUser } from "$lib/types/pocketid-user.type";

  interface Props {
    // Get data from the server load function
    data: {
      userGroups: UserGroup[];
      passkeys: any[];
      apiKeys: ApiKey[];
      apiKeysPagination: any;
      status: "success" | "error";
      error: string | null;
      currentUserInfo: PocketIdUser;
    };
  }

  let { data }: Props = $props();

  // User profile data
  let user = $derived($auth.user);

  // Get user data from server-loaded data
  let userGroups: UserGroup[] = $derived(data.userGroups || []);
  let passkeys = $derived(data.passkeys || []);
  let apiKeys: ApiKey[] = $derived(data.apiKeys || []);
  let dataError = $derived(data.status === "error" ? data.error : null);
  let loading = $derived(false);
  console.log(data.currentUserInfo);
</script>

<svelte:head>
  <title>My Profile - Pocket ID Portal</title>
</svelte:head>

<div class="space-y-8 max-w-[1200px] mx-auto">
  <!-- Hero Header Section with Gradient Background -->

  <HeroHeader
    title="My Profile"
    description="View and manage your Pocket ID profile information"
    icon={User}
  />

  <div class="grid gap-6">
    <!-- Profile Information Card -->
    <Card.Root
      class="overflow-hidden border shadow-sm animate-fade-in"
      style="animation-delay: 100ms;"
    >
      <Card.Header class="bg-card border-b px-6 pb-5">
        <div class="flex items-center gap-3">
          <div class="bg-primary/10 p-1.5 rounded-md">
            <User class="size-4 text-primary" />
          </div>
          <div>
            <Card.Title>Profile Information</Card.Title>
            <Card.Description class="text-xs mt-1">
              Your personal information from Pocket ID
            </Card.Description>
          </div>
        </div>
      </Card.Header>

      <Card.Content class="px-6 pt-8 pb-8">
        <div class="space-y-8">
          <!-- Profile picture and name section -->
          <div
            class="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b"
          >
            <div class="relative">
              {#if user?.picture}
                <img
                  src={user.picture}
                  alt="Profile"
                  class="size-24 rounded-full object-cover border-4 border-primary/20"
                />
              {:else}
                <div
                  class="size-24 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <span class="text-3xl font-medium text-primary">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              {/if}
            </div>

            <div class="text-center sm:text-left">
              <h2 class="text-2xl font-bold">{user?.name || "User"}</h2>
              <p class="text-sm text-muted-foreground mt-1">
                {user?.email || "No email provided"}
              </p>
              <div
                class="mt-3 flex flex-wrap justify-center sm:justify-start gap-2"
              >
                {#if user?.email_verified}
                  <Badge
                    variant="outline"
                    class="bg-green-500/10 text-green-600">Verified Email</Badge
                  >
                {/if}
                {#if data.currentUserInfo.isAdmin}
                  <Badge variant="outline" class=" bg-red-500/10 text-red-600">
                    Admin
                  </Badge>
                {/if}
              </div>
            </div>
          </div>

          <!-- User details grid -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {#if user?.given_name || user?.family_name}
              <div class="space-y-1.5">
                <p class="text-sm font-medium">Full Name</p>
                <p class="text-sm bg-muted/30 py-2 px-3 rounded-md">
                  {[user?.given_name, user?.family_name]
                    .filter(Boolean)
                    .join(" ") || "Not provided"}
                </p>
              </div>
            {/if}

            <div class="space-y-1.5">
              <p class="text-sm font-medium">Email</p>
              <p
                class="text-sm bg-muted/30 py-2 px-3 rounded-md flex items-center justify-between"
              >
                <span>{user?.email || "Not provided"}</span>
                {#if user?.email_verified}
                  <Badge
                    variant="outline"
                    class="bg-green-500/10 text-green-600 text-xs"
                  >
                    Verified
                  </Badge>
                {/if}
              </p>
            </div>

            {#if user?.preferred_username}
              <div class="space-y-1.5">
                <p class="text-sm font-medium">Username</p>
                <p class="text-sm bg-muted/30 py-2 px-3 rounded-md">
                  {user?.preferred_username}
                </p>
              </div>
            {/if}

            {#if user?.sub}
              <div class="space-y-1.5">
                <p class="text-sm font-medium">User ID</p>
                <p
                  class="text-sm bg-muted/30 py-2 px-3 rounded-md overflow-hidden text-ellipsis"
                >
                  {user?.sub}
                </p>
              </div>
            {/if}
          </div>
        </div>
      </Card.Content>

      <Card.Footer class="px-6 py-4 bg-muted/5 border-t">
        <a
          href={`${env.PUBLIC_OIDC_ISSUER}/settings/account`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" class="gap-2">
            <User class="size-4" />
            Manage Profile in Pocket ID
          </Button>
        </a>
      </Card.Footer>
    </Card.Root>

    <!-- Access Groups Card -->
    <Card.Root
      class="overflow-hidden border shadow-sm animate-fade-in"
      style="animation-delay: 150ms;"
    >
      <Card.Header class="bg-card border-b px-6 pb-5">
        <div class="flex items-center gap-3">
          <div class="bg-primary/10 p-1.5 rounded-md">
            <Shield class="size-4 text-primary" />
          </div>
          <div>
            <Card.Title>Access Groups</Card.Title>
            <Card.Description class="text-xs mt-1">
              Groups that determine your access to applications
            </Card.Description>
          </div>
        </div>
      </Card.Header>

      <Card.Content class="px-6 pt-8 pb-8">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <div class="bg-primary/5 p-1 rounded-md">
              <Users class="size-4 text-primary" />
            </div>
            <h3 class="font-medium">Your Access Groups</h3>
          </div>
          <div class="bg-muted text-xs font-semibold rounded-full px-2 py-0.5">
            {userGroups.length}
          </div>
        </div>

        {#if loading}
          <div
            class="flex items-center justify-center h-24 bg-muted/5 rounded-lg border border-dashed"
          >
            <p class="text-sm text-muted-foreground">Loading groups...</p>
          </div>
        {:else if dataError}
          <div
            class="flex items-center justify-center h-24 bg-destructive/5 rounded-lg border border-dashed border-destructive/20"
          >
            <p class="text-sm text-destructive">Error: {dataError}</p>
          </div>
        {:else if userGroups.length > 0}
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {#each userGroups as group, i (group.name)}
              <div
                class="animate-fade-in opacity-0"
                style="animation-delay: {150 + i * 50}ms"
              >
                <Badge
                  variant="outline"
                  class="w-full justify-between py-1.5 px-3 text-xs hover:border-primary/50"
                >
                  <span class="truncate">{group.name}</span>
                  <div class="size-2 rounded-full bg-primary/70"></div>
                </Badge>
              </div>
            {/each}
          </div>
        {:else}
          <div
            class="grow text-muted-foreground text-sm flex items-center justify-center gap-2 p-6 border border-dashed rounded-lg bg-muted/5"
          >
            <Users class="size-4" />
            <span>No groups assigned</span>
          </div>
        {/if}
      </Card.Content>
    </Card.Root>

    <!-- Passkeys Card -->
    <Card.Root
      class="overflow-hidden border shadow-sm animate-fade-in"
      style="animation-delay: 200ms;"
    >
      <Card.Header class="bg-card border-b px-6 pb-5">
        <div class="flex items-center gap-3">
          <div class="bg-primary/10 p-1.5 rounded-md">
            <Key class="size-4 text-primary" />
          </div>
          <div>
            <Card.Title>Passkeys</Card.Title>
            <Card.Description class="text-xs mt-1">
              Your registered passwordless authentication methods
            </Card.Description>
          </div>
        </div>
      </Card.Header>

      <Card.Content class="px-6 pt-8 pb-8">
        {#if loading}
          <div
            class="flex items-center justify-center h-24 bg-muted/5 rounded-lg border border-dashed"
          >
            <p class="text-sm text-muted-foreground">Loading passkeys...</p>
          </div>
        {:else if dataError}
          <div
            class="bg-destructive/5 p-4 rounded-lg border border-destructive/20"
          >
            <p class="text-sm text-destructive">Error: {dataError}</p>
            <p class="text-xs text-muted-foreground mt-2">
              Unable to load your passkeys. You can still manage them directly
              in Pocket ID.
            </p>
          </div>
        {:else if passkeys.length === 0}
          <div class="bg-muted/10 p-4 rounded-lg border">
            <p class="text-sm">
              You don't have any passkeys registered. Passkeys provide a secure,
              passwordless way to authenticate. You can register your first
              passkey in Pocket ID.
            </p>
          </div>
        {:else}
          <div class="space-y-4">
            <p class="text-sm">
              You have {passkeys.length} registered passkey{passkeys.length !==
              1
                ? "s"
                : ""}.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {#each passkeys as passkey, i (passkey.id)}
                <div
                  class="flex items-center gap-3 p-4 rounded-xl bg-linear-to-br from-muted/30 to-muted/10 border
                         hover:shadow-md transition-all animate-fade-in opacity-0 relative overflow-hidden group"
                  style="animation-delay: {200 + i * 75}ms"
                >
                  <div
                    class="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0
                              group-hover:opacity-100 transition-opacity duration-300"
                  ></div>

                  <div
                    class="size-12 rounded-full bg-primary/10 flex items-center justify-center
                              border-4 border-background shadow-sm relative z-10"
                  >
                    <Key class="size-5 text-primary" />
                  </div>

                  <div class="flex-1 relative z-10">
                    <p class="font-medium text-sm">
                      {passkey.name || `Passkey ${i + 1}`}
                    </p>
                    <div class="flex items-center gap-2 mt-1">
                      <p class="text-xs text-muted-foreground">
                        {new Date(passkey.created_at).toLocaleDateString()}
                      </p>
                      {#if passkey.device}
                        <!-- We need to somehow implement this in pocket id first -->
                        <!-- <div
                          class="size-1 rounded-full bg-muted-foreground/30"
                        ></div>
                        <Badge
                          variant="outline"
                          class="text-[10px] py-0 px-1.5 h-4"
                        >
                          {passkey.device}
                        </Badge> -->
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </Card.Content>

      <Card.Footer class="px-6 py-4 bg-muted/5 border-t">
        <a
          href={`${env.PUBLIC_OIDC_ISSUER}/settings/account`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" class="gap-2">
            <Key class="size-4" />
            Manage Passkeys in Pocket ID
          </Button>
        </a>
      </Card.Footer>
    </Card.Root>

    <!-- API Keys Card -->
    <Card.Root
      class="overflow-hidden border shadow-sm animate-fade-in"
      style="animation-delay: 250ms;"
    >
      <Card.Header class="bg-card border-b px-6 pb-5">
        <div class="flex items-center gap-3">
          <div class="bg-primary/10 p-1.5 rounded-md">
            <KeyRound class="size-4 text-primary" />
          </div>
          <div>
            <Card.Title>API Keys</Card.Title>
            <Card.Description class="text-xs mt-1">
              Your API keys for programmatic access to Pocket ID
            </Card.Description>
          </div>
        </div>
      </Card.Header>

      <Card.Content class="px-6 pt-8 pb-8">
        <ApiKeysList
          {apiKeys}
          isLoading={loading}
          error={dataError}
          pagination={data.apiKeysPagination}
        />
      </Card.Content>

      <Card.Footer class="px-6 py-4 bg-muted/5 border-t">
        <a
          href={`${env.PUBLIC_OIDC_ISSUER}/settings/admin/api-keys`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" class="gap-2">
            <KeyRound class="size-4" />
            Manage API Keys in Pocket ID
          </Button>
        </a>
      </Card.Footer>
    </Card.Root>
  </div>
</div>
