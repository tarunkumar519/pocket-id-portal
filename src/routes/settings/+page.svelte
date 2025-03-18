<script lang="ts">
  import { onMount } from "svelte";
  import { auth } from "$lib/stores/auth.store";
  import { config, type UserConfig } from "$lib/stores/portal-config.store";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import { env } from "$env/dynamic/public";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import { UserService } from "$lib/services/user-service";
  import type { UserGroup, ApiError } from "$lib/types";
  import { goto } from "$app/navigation";

  // User profile data
  $: user = $auth.user;

  // User groups state
  let userGroups: UserGroup[] = [];
  let groupsError: ApiError = null;
  let loading = true;

  // Use the config store values
  let themePreference = $config.theme;
  let landingPage = $config.landingPage;

  // Theme options
  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ] as const;

  // Landing page options
  const pageOptions = [
    { value: "dashboard", label: "Dashboard" },
    { value: "settings", label: "Settings" },
  ] as const;

  onMount(async () => {
    try {
      if (!$auth.user || !$auth.user.sub) {
        groupsError = "User ID not found";
        loading = false;
        return;
      }

      // Use UserService directly instead of pocketIdService
      const headers = { 
        "Content-Type": "application/json"
      };
      userGroups = await UserService.fetchUserGroups($auth.user.sub, fetch, headers);
      loading = false;
    } catch (error) {
      console.error("Error fetching user groups:", error);
      groupsError = error instanceof Error ? error.message : String(error);
      loading = false;
    }
  });

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

  // Derived values for display in trigger
  $: themeLabel =
    themeOptions.find((t) => t.value === themePreference)?.label ??
    "Select theme";
  $: pageLabel =
    pageOptions.find((p) => p.value === landingPage)?.label ?? "Select page";
</script>

<svelte:head>
  <title>Settings - Pocket ID Portal</title>
</svelte:head>

<div class="space-y-6 max-w-4xl mx-auto">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
    <p class="text-sm text-muted-foreground mt-1">
      Manage your account settings and preferences
    </p>
  </div>

  <div class="grid gap-6">
    <!-- Profile Information -->
    <Card.Root>
      <Card.Header>
        <Card.Title>Profile Information</Card.Title>
        <Card.Description
          >View your profile information from Pocket ID</Card.Description
        >
      </Card.Header>
      <Card.Content>
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium">Name</p>
              <p class="text-sm text-muted-foreground">
                {user?.name || "Not provided"}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium">Email</p>
              <p class="text-sm text-muted-foreground">
                {user?.email || "Not provided"}
              </p>
            </div>
          </div>

          <!-- User Groups Section -->
          <div>
            <p class="text-sm font-medium mb-2">Groups</p>
            {#if loading}
              <p class="text-sm text-muted-foreground">Loading groups...</p>
            {:else if groupsError}
              <p class="text-sm text-red-500">Error: {groupsError}</p>
            {:else if userGroups.length > 0}
              <div class="flex flex-wrap gap-2">
                {#each userGroups as group}
                  <Badge variant="secondary">{group.name}</Badge>
                {/each}
              </div>
            {:else}
              <p class="text-sm text-muted-foreground">No groups assigned</p>
            {/if}
          </div>
        </div>
      </Card.Content>
      <Card.Footer>
        <a
          href={`${env.PUBLIC_OIDC_ISSUER}/settings/account`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="default">Manage Profile in Pocket ID</Button>
        </a>
      </Card.Footer>
    </Card.Root>

    <!-- Passkeys Management -->
    <Card.Root>
      <Card.Header>
        <Card.Title>Passkeys</Card.Title>
        <Card.Description
          >Manage your passkeys for passwordless authentication</Card.Description
        >
      </Card.Header>
      <Card.Content>
        <p class="text-sm">
          Passkeys provide a secure, passwordless way to authenticate. You can
          register and manage your passkeys directly in Pocket ID.
        </p>
      </Card.Content>
      <Card.Footer>
        <a
          href={`${env.PUBLIC_OIDC_ISSUER}/settings/account`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="default">Manage Passkeys</Button>
        </a>
      </Card.Footer>
    </Card.Root>

    <!-- Application Preferences -->
    <Card.Root>
      <Card.Header>
        <Card.Title>Portal Preferences</Card.Title>
        <Card.Description
          >Customize your experience in the Pocket ID Portal</Card.Description
        >
      </Card.Header>
      <Card.Content>
        <div class="space-y-4">
          <div>
            <p class="text-sm font-medium mb-2">Theme Preference</p>
            <Select.Root
              type="single"
              value={themePreference}
              onValueChange={(value: string) =>
                updateTheme(value as UserConfig["theme"])}
            >
              <Select.Trigger class="w-[180px]">
                {themeLabel}
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  <Select.GroupHeading>Theme</Select.GroupHeading>
                  {#each themeOptions as option (option.value)}
                    <Select.Item value={option.value} label={option.label}>
                      {option.label}
                    </Select.Item>
                  {/each}
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </div>

          <Separator />

          <div>
            <p class="text-sm font-medium mb-2">Default Landing Page</p>
            <Select.Root
              type="single"
              value={landingPage}
              onValueChange={(value: string) =>
                updateLandingPage(value as UserConfig["landingPage"])}
            >
              <Select.Trigger class="w-[180px]">
                {pageLabel}
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  <Select.GroupHeading>Page</Select.GroupHeading>
                  {#each pageOptions as option (option.value)}
                    <Select.Item value={option.value} label={option.label}>
                      {option.label}
                    </Select.Item>
                  {/each}
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</div>
