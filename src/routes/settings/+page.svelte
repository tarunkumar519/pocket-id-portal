<script lang="ts">
  import { config, type UserConfig } from "$lib/stores/portal-config.store";
  import * as Card from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
  import {
    Settings2,
    Palette,
    Monitor,
    Sun,
    Moon,
    Layout,
  } from "@lucide/svelte";

  // Use the config store values
  let themePreference = $state($config.theme);
  let landingPage = $state($config.landingPage);

  // Landing page options
  const pageOptions = [
    { value: "dashboard", label: "Dashboard", icon: Layout },
    { value: "settings", label: "Settings", icon: Settings2 },
    { value: "profile", label: "Profile", icon: Layout },
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
          Customize your Pocket ID Portal experience.
        </p>
      </div>
    </div>
  </div>

  <div class="grid gap-6">
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
