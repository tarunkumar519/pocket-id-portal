<script lang="ts">
  import { onMount } from "svelte";
  import { auth } from "$lib/stores/auth";
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import { env } from "$env/dynamic/public";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import { pocketIdService } from "$lib/services/pocket-id-api";
  import type { UserGroup, ApiError } from "$lib/types";

  // User profile data
  $: user = $auth.user;

  // User groups state
  let userGroups: UserGroup[] = [];
  let groupsError: ApiError = null;
  let loading = true;

  onMount(async () => {
    try {
      // Use the user information from the auth store instead of direct localStorage access
      if (!$auth.user || !$auth.user.sub) {
        groupsError = "User ID not found";
        loading = false;
        return;
      }

      // Use the user sub (ID) from the auth store
      userGroups = await pocketIdService.getUserGroups($auth.user.sub);
      loading = false;
    } catch (error) {
      console.error("Error fetching user groups:", error);
      groupsError = error instanceof Error ? error.message : String(error);
      loading = false;
    }
  });

  // Theme options
  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  // Landing page options
  const pageOptions = [
    { value: "dashboard", label: "Dashboard" },
    { value: "applications", label: "Applications" },
  ];

  // Theme and landing page preferences
  let themePreference = "system";
  let landingPage = "dashboard";

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
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription
          >View your profile information from Pocket ID</CardDescription
        >
      </CardHeader>
      <CardContent>
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
      </CardContent>
      <CardFooter>
        <a
          href={`${env.PUBLIC_OIDC_ISSUER}/settings/account`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="default">Manage Profile in Pocket ID</Button>
        </a>
      </CardFooter>
    </Card>

    <!-- Passkeys Management -->
    <Card>
      <CardHeader>
        <CardTitle>Passkeys</CardTitle>
        <CardDescription
          >Manage your passkeys for passwordless authentication</CardDescription
        >
      </CardHeader>
      <CardContent>
        <p class="text-sm">
          Passkeys provide a secure, passwordless way to authenticate. You can
          register and manage your passkeys directly in Pocket ID.
        </p>
      </CardContent>
      <CardFooter>
        <a
          href={`${env.PUBLIC_OIDC_ISSUER}/settings/account`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="default">Manage Passkeys</Button>
        </a>
      </CardFooter>
    </Card>

    <!-- Application Preferences -->
    <Card>
      <CardHeader>
        <CardTitle>Portal Preferences</CardTitle>
        <CardDescription
          >Customize your experience in the Pocket ID Portal</CardDescription
        >
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <p class="text-sm font-medium mb-2">Theme Preference</p>
            <Select.Root type="single" bind:value={themePreference}>
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
            <Select.Root type="single" bind:value={landingPage}>
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
      </CardContent>
    </Card>
  </div>
</div>
