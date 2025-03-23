<script lang="ts">
  import { page } from "$app/state";
  import { cn } from "$lib/utils";
  import { auth } from "$lib/stores/auth.store";
  import { env } from "$env/dynamic/public";
  import { LogoutService } from "$lib/services/logout-service";
  import { LogOut, LayoutDashboard, Settings } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";

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

  // Handle logout using the LogoutService
  async function handleLogout() {
    await LogoutService.logout();
  }
</script>

<div class="h-screen flex flex-col border-r bg-background w-64 min-w-64">
  <div class="p-6 pb-5">
    <div class="flex items-center gap-3 mb-2">
      <div class="bg-primary/10 p-2 rounded-lg">
        <img src={logoUrl} alt="Pocket ID Logo" class="h-6 w-auto" />
      </div>
      <h1 class="text-xl font-bold">Pocket ID</h1>
    </div>
    <p class="text-xs text-muted-foreground ml-1">User Portal</p>
  </div>

  <Separator />

  <nav class="flex-1 p-4 space-y-1.5">
    <a
      href="/dashboard"
      class={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors",
        isOnDashboard
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground hover:bg-muted/50"
      )}
    >
      <LayoutDashboard class="h-4 w-4" />
      Dashboard
    </a>
    <a
      href="/settings"
      class={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors",
        isOnSettings
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground hover:bg-muted/50"
      )}
    >
      <Settings class="h-4 w-4" />
      Settings
    </a>
  </nav>

  <div class="p-4 mt-auto">
    <div class="p-4 rounded-xl border bg-card shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        {#if user?.picture}
          <img
            src={user.picture}
            alt="User avatar"
            class="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
          />
        {:else}
          <div
            class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
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
        <LogOut class="h-3.5 w-3.5" />
        Sign Out
      </Button>
    </div>
  </div>
</div>
