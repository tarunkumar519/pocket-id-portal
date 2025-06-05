<script lang="ts">
  import { page } from "$app/state";
  import { cn } from "$lib/utils";
  import { auth } from "$lib/stores/auth.store";
  import { env } from "$env/dynamic/public";
  import { LogoutService } from "$lib/services/logout-service";
  import {
    LogOut,
    LayoutDashboard,
    Settings,
    ChevronLeft,
    ChevronRight,
    User,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import { browser } from "$app/environment";

  // Get the base URL from environment variables
  const baseUrl = $state(env.PUBLIC_OIDC_ISSUER);
  const logoUrl = $derived(
    `${baseUrl}/api/application-configuration/logo?light=false`
  );

  // State for user data from auth store
  const user = $derived($auth.user);

  // Derived values for navigation
  const isOnDashboard = $derived(
    page.url.pathname === "/" || page.url.pathname === "/dashboard"
  );
  const isOnSettings = $derived(page.url.pathname.startsWith("/settings"));
  const isOnProfile = $derived(page.url.pathname.startsWith("/profile"));

  // Collapsible state
  let isCollapsed = $state(false);

  // Save state to localStorage
  function toggleSidebar() {
    isCollapsed = !isCollapsed;

    if (browser) {
      localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
    }
  }

  // Load state from localStorage on initialization
  if (browser) {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      isCollapsed = savedState === "true";
    }
  }

  // Handle logout using the LogoutService
  async function handleLogout() {
    await LogoutService.logout();
  }
</script>

<div
  class={cn(
    "h-screen flex flex-col border-r bg-background transition-all duration-300",
    isCollapsed ? "w-16 min-w-16" : "w-64 min-w-64"
  )}
>
  <div
    class={cn(
      "flex items-center justify-between transition-all duration-300",
      isCollapsed ? "px-3 py-6" : "p-6 pb-5"
    )}
  >
    {#if !isCollapsed}
      <div>
        <div class="flex items-center gap-3 mb-2">
          <div class="bg-primary/10 p-2 rounded-lg shrink-0">
            <img src={logoUrl} alt="Pocket ID Logo" class="h-6 w-auto" />
          </div>
          <h1 class="text-xl font-bold">Pocket ID</h1>
        </div>
        <p class="text-xs text-muted-foreground ml-1">User Portal</p>
      </div>
    {:else}
      <div class="mx-auto bg-primary/10 p-2 rounded-lg">
        <img src={logoUrl} alt="Pocket ID Logo" class="h-6 w-auto" />
      </div>
    {/if}
  </div>

  <!-- Toggle button -->
  <div class="relative">
    <button
      class="absolute -right-3 top-0 size-6 rounded-full bg-background border shadow-sm flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
      onclick={toggleSidebar}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {#if isCollapsed}
        <ChevronRight class="size-4" />
      {:else}
        <ChevronLeft class="size-4" />
      {/if}
    </button>
  </div>

  <Separator />

  <nav class={cn("flex-1", isCollapsed ? "p-2 space-y-3" : "p-4 space-y-1.5")}>
    <a
      href="/dashboard"
      class={cn(
        "flex items-center transition-colors rounded-lg",
        isCollapsed ? "justify-center p-2" : "gap-3 px-4 py-2.5 text-sm",
        isOnDashboard
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground hover:bg-muted/50"
      )}
      aria-label="Dashboard"
    >
      <LayoutDashboard class="size-4" />
      {#if !isCollapsed}
        <span>Dashboard</span>
      {/if}
    </a>

    <!-- Add new Profile link here -->
    <a
      href="/profile"
      class={cn(
        "flex items-center transition-colors rounded-lg",
        isCollapsed ? "justify-center p-2" : "gap-3 px-4 py-2.5 text-sm",
        isOnProfile
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground hover:bg-muted/50"
      )}
      aria-label="Profile"
    >
      <User class="size-4" />
      {#if !isCollapsed}
        <span>Profile</span>
      {/if}
    </a>

    <a
      href="/settings"
      class={cn(
        "flex items-center transition-colors rounded-lg",
        isCollapsed ? "justify-center p-2" : "gap-3 px-4 py-2.5 text-sm",
        isOnSettings
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground hover:bg-muted/50"
      )}
      aria-label="Settings"
    >
      <Settings class="size-4" />
      {#if !isCollapsed}
        <span>Settings</span>
      {/if}
    </a>
  </nav>

  <div class={cn("mt-auto", isCollapsed ? "p-2" : "p-4")}>
    <div
      class={cn(
        "border bg-card shadow-sm rounded-xl",
        isCollapsed ? "p-2" : "p-4"
      )}
    >
      {#if !isCollapsed}
        <div class="flex items-center gap-3 mb-4">
          {#if user?.picture}
            <img
              src={user.picture}
              alt="User avatar"
              class="size-10 rounded-full object-cover border-2 border-primary/20"
            />
          {:else}
            <div
              class="size-10 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <span class="text-sm font-medium text-primary">
                {user?.name ? user.name.charAt(0) : "U"}
              </span>
            </div>
          {/if}
          <div class="overflow-hidden">
            <p class="text-sm font-medium line-clamp-1">
              {user?.name || "User"}
            </p>
            <p class="text-xs text-muted-foreground truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          class="w-full flex items-center justify-center gap-2 text-sm"
          onclick={handleLogout}
        >
          <LogOut class="size-3.5" />
          Sign Out
        </Button>
      {:else}
        <!-- Collapsed user profile -->
        <div class="flex flex-col items-center gap-2">
          {#if user?.picture}
            <img
              src={user.picture}
              alt="User avatar"
              class="size-8 rounded-full object-cover border-2 border-primary/20"
            />
          {:else}
            <div
              class="size-8 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <span class="text-xs font-medium text-primary">
                {user?.name ? user.name.charAt(0) : "U"}
              </span>
            </div>
          {/if}

          <Button
            variant="outline"
            size="icon"
            class="size-8"
            onclick={handleLogout}
            aria-label="Sign out"
          >
            <LogOut class="size-3.5" />
          </Button>
        </div>
      {/if}
    </div>
  </div>
</div>
