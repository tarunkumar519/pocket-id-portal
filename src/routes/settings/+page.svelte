<script lang="ts">
  import { auth } from "$lib/stores/auth.store";
  import { config, type UserConfig } from "$lib/stores/portal-config.store";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import { env } from "$env/dynamic/public";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
  import {
    Users,
    User,
    Key,
    Settings2,
    Palette,
    Monitor,
    Sun,
    Moon,
    Layout,
  } from "@lucide/svelte";
  import type { UserGroup } from "$lib/types";

  interface Props {
    // Get data from the server load function
    data: {
      userGroups: UserGroup[];
      status: "success" | "error";
      error: string | null;
    };
  }

  let { data }: Props = $props();

  // User profile data
  let user = $derived($auth.user);

  // Get user groups from server-loaded data
  let userGroups: UserGroup[] = $derived(data.userGroups || []);
  let groupsError = $derived(data.status === "error" ? data.error : null);
  let loading = $derived(false);

  // Use the config store values
  let themePreference = $state($config.theme);
  let landingPage = $state($config.landingPage);

  // Landing page options
  const pageOptions = [
    { value: "dashboard", label: "Dashboard", icon: Layout },
    { value: "settings", label: "Settings", icon: Settings2 },
  ] as const;

  // Update theme preference when selected
  function updateTheme(value: UserConfig["theme"]) {
    themePreference = value;
    config.setTheme(value);
  }

  // Update landing page preference when selected
  function updateLandingPage(value: UserConfig["landingPage"]) {
    landingPage = value;
    config.setLandingPage(value);
  }

  let pageLabel = $derived(
    pageOptions.find((p) => p.value === landingPage)?.label ?? "Select page"
  );
</script>

<svelte:head>
  <title>Settings - Pocket ID Portal</title>
</svelte:head>

<div class="space-y-8 max-w-[1200px] mx-auto">
  <!-- Hero Header Section with Gradient Background -->
  <div
    class="rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 p-8 border shadow-sm animate-fade-in"
  >
    <div
      class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
    >
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <div class="bg-primary/10 p-2 rounded-full">
            <Settings2 class="h-6 w-6 text-primary" />
          </div>
          <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <p class="text-muted-foreground max-w-lg">
          Manage your account settings and customize your Pocket ID Portal
          experience.
        </p>
      </div>
    </div>
  </div>

  <div class="grid gap-6">
    <!-- Profile Information -->
    <Card.Root
      class="overflow-hidden border shadow-sm animate-fade-in"
      style="animation-delay: 100ms;"
    >
      <Card.Header class="bg-card border-b px-6 pb-5">
        <div class="flex items-center gap-3">
          <div class="bg-primary/10 p-1.5 rounded-md">
            <User class="h-4 w-4 text-primary" />
          </div>
          <div>
            <Card.Title>Profile Information</Card.Title>
            <Card.Description class="text-xs mt-1">
              View your profile information from Pocket ID
            </Card.Description>
          </div>
        </div>
      </Card.Header>

      <Card.Content class="px-6 pt-8 pb-8">
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <p class="text-sm font-medium">Name</p>
              <p class="text-sm bg-muted/30 py-2 px-3 rounded-md">
                {user?.name || "Not provided"}
              </p>
            </div>
            <div class="space-y-1.5">
              <p class="text-sm font-medium">Email</p>
              <p class="text-sm bg-muted/30 py-2 px-3 rounded-md">
                {user?.email || "Not provided"}
              </p>
            </div>
          </div>

          <!-- User Groups Section -->
          <div>
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2">
                <div class="bg-primary/10 p-1.5 rounded-md">
                  <Users class="h-4 w-4 text-primary" />
                </div>
                <h3 class="font-medium">Your Access Groups</h3>
              </div>
              <div
                class="bg-muted text-xs font-semibold rounded-full px-2 py-0.5"
              >
                {userGroups.length}
              </div>
            </div>

            {#if loading}
              <div
                class="flex items-center justify-center h-24 bg-muted/5 rounded-lg border border-dashed"
              >
                <p class="text-sm text-muted-foreground">Loading groups...</p>
              </div>
            {:else if groupsError}
              <div
                class="flex items-center justify-center h-24 bg-destructive/5 rounded-lg border border-dashed border-destructive/20"
              >
                <p class="text-sm text-destructive">Error: {groupsError}</p>
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
                      <div class="w-2 h-2 rounded-full bg-primary/70"></div>
                    </Badge>
                  </div>
                {/each}
              </div>
            {:else}
              <div
                class="flex-grow text-muted-foreground text-sm flex items-center justify-center gap-2 p-6 border border-dashed rounded-lg bg-muted/5"
              >
                <Users class="h-4 w-4" />
                <span>No groups assigned</span>
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
            <User class="h-4 w-4" />
            Manage Profile in Pocket ID
          </Button>
        </a>
      </Card.Footer>
    </Card.Root>

    <!-- Passkeys Management -->
    <Card.Root
      class="overflow-hidden border shadow-sm animate-fade-in"
      style="animation-delay: 150ms;"
    >
      <Card.Header class="bg-card border-b px-6 pb-5">
        <div class="flex items-center gap-3">
          <div class="bg-primary/10 p-1.5 rounded-md">
            <Key class="h-4 w-4 text-primary" />
          </div>
          <div>
            <Card.Title>Passkeys</Card.Title>
            <Card.Description class="text-xs mt-1">
              Manage your passkeys for passwordless authentication
            </Card.Description>
          </div>
        </div>
      </Card.Header>

      <Card.Content class="px-6 pt-6">
        <div class="bg-muted/10 p-4 rounded-lg border">
          <p class="text-sm">
            Passkeys provide a secure, passwordless way to authenticate. You can
            register and manage your passkeys directly in Pocket ID.
          </p>
        </div>
      </Card.Content>

      <Card.Footer class="px-6 py-4 bg-muted/5 border-t">
        <a
          href={`${env.PUBLIC_OIDC_ISSUER}/settings/account`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" class="gap-2">
            <Key class="h-4 w-4" />
            Manage Passkeys
          </Button>
        </a>
      </Card.Footer>
    </Card.Root>

    <!-- Application Preferences -->
    <Card.Root
      class="overflow-hidden border shadow-sm animate-fade-in"
      style="animation-delay: 200ms;"
    >
      <Card.Header class="bg-card border-b px-6 pb-5">
        <div class="flex items-center gap-3">
          <div class="bg-primary/10 p-1.5 rounded-md">
            <Palette class="h-4 w-4 text-primary" />
          </div>
          <div>
            <Card.Title>Portal Preferences</Card.Title>
            <Card.Description class="text-xs mt-1">
              Customize your experience in the Pocket ID Portal
            </Card.Description>
          </div>
        </div>
      </Card.Header>

      <Card.Content class="px-6 pt-6">
        <div class="space-y-10">
          <div>
            <div class="flex items-center gap-2 mb-6">
              <div class="bg-primary/5 p-1 rounded-md">
                <Palette class="h-4 w-4 text-primary" />
              </div>
              <h3 class="font-medium text-sm">Theme Preference</h3>
            </div>

            <RadioGroup.Root
              class="grid max-w-xl grid-cols-1 sm:grid-cols-3 gap-4"
              orientation="horizontal"
              value={themePreference}
              onValueChange={(value) =>
                updateTheme(value as UserConfig["theme"])}
            >
              <!-- Light theme option -->
              <Label
                class="cursor-pointer [&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:ring-2 [&:has([data-state=checked])>div]:ring-primary/20"
              >
                <RadioGroup.Item value="light" class="sr-only" />
                <div
                  class="border hover:border-primary/50 rounded-xl p-3 transition-all"
                >
                  <div class="flex items-center justify-center mb-4">
                    <div class="bg-muted/30 p-2 rounded-full">
                      <Sun class="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                  <span class="block w-full text-center font-medium text-sm">
                    Light
                  </span>
                </div>
              </Label>

              <!-- Dark theme option -->
              <Label
                class="cursor-pointer [&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:ring-2 [&:has([data-state=checked])>div]:ring-primary/20"
              >
                <RadioGroup.Item value="dark" class="sr-only" />
                <div
                  class="border hover:border-primary/50 rounded-xl p-3 transition-all"
                >
                  <div class="flex items-center justify-center mb-4">
                    <div class="bg-muted/30 p-2 rounded-full">
                      <Moon class="h-5 w-5 text-indigo-400" />
                    </div>
                  </div>
                  <span class="block w-full text-center font-medium text-sm">
                    Dark
                  </span>
                </div>
              </Label>

              <!-- System theme option -->
              <Label
                class="cursor-pointer [&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:ring-2 [&:has([data-state=checked])>div]:ring-primary/20"
              >
                <RadioGroup.Item value="system" class="sr-only" />
                <div
                  class="border hover:border-primary/50 rounded-xl p-3 transition-all"
                >
                  <div class="flex items-center justify-center mb-4">
                    <div class="bg-muted/30 p-2 rounded-full">
                      <Monitor class="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                  <span class="block w-full text-center font-medium text-sm">
                    System
                  </span>
                </div>
              </Label>
            </RadioGroup.Root>
          </div>

          <Separator class="my-8" />

          <div>
            <div class="flex items-center gap-2 mb-6">
              <div class="bg-primary/5 p-1 rounded-md">
                <Layout class="h-4 w-4 text-primary" />
              </div>
              <h3 class="font-medium text-sm">Default Landing Page</h3>
            </div>

            <div class="flex flex-col sm:flex-row gap-4">
              {#each pageOptions as option (option.value)}
                {@const Icon = option.icon}
                <button
                  type="button"
                  class={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:border-primary/50 transition-all ${landingPage === option.value ? "border-primary ring-2 ring-primary/20 bg-primary/5" : ""}`}
                  onclick={() => updateLandingPage(option.value)}
                >
                  <div class="bg-muted/30 p-1.5 rounded-md">
                    <Icon class="h-4 w-4 text-primary" />
                  </div>
                  <span class="text-sm font-medium">{option.label}</span>
                </button>
              {/each}
            </div>
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</div>

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
    opacity: 0;
  }
</style>
