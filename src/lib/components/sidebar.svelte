<script lang="ts">
  import { page } from "$app/state";
  import { cn } from "$lib/utils";
  import { auth } from "$lib/stores/auth.store";
  import { env } from "$env/dynamic/public";
  import { LogoutService } from "$lib/services/logout-service";

  // Get the base URL from environment variables
  const baseUrl = env.PUBLIC_OIDC_ISSUER;
  const logoUrl = `${baseUrl}/api/application-configuration/logo?light=false`;

  // Handle logout using the LogoutService
  async function handleLogout() {
    await LogoutService.logout();
  }
</script>

<div class="h-screen flex flex-col border-r bg-sidebar-background">
  <div class="p-6">
    <div class="flex items-center gap-3 mb-2">
      <img
        src={logoUrl}
        alt="Pocket ID Logo"
        class="h-8 w-auto"
        on:error={() => {
          /* Fallback to text if image fails */
        }}
      />
      <h1 class="text-2xl font-bold text-black dark:text-white">Pocket ID</h1>
    </div>
    <p class="text-sm text-muted-foreground">User Portal</p>
  </div>

  <nav class="flex-1 px-4 space-y-1">
    <a
      href="/dashboard"
      class={cn(
        "flex items-center px-4 py-2 text-sm rounded-md",
        page.url.pathname === "/" || page.url.pathname === "/dashboard"
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      Dashboard
    </a>
    <a
      href="/settings"
      class={cn(
        "flex items-center px-4 py-2 text-sm rounded-md",
        page.url.pathname.startsWith("/settings")
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      Settings
    </a>
  </nav>

  <div class="p-4 border-t border-sidebar-border">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3 px-3 py-2">
        {#if $auth.user?.picture}
          <img
            src={$auth.user.picture}
            alt="User avatar"
            class="w-8 h-8 rounded-full object-cover"
            on:error={() => {
              // Handle error by falling back to initials
            }}
          />
        {:else}
          <div
            class="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center"
          >
            <span class="text-sm font-medium text-sidebar-accent-foreground">
              {$auth.user?.name ? $auth.user.name.charAt(0) : "U"}
            </span>
          </div>
        {/if}
        <div>
          <p class="text-sm font-medium text-sidebar-foreground">
            {$auth.user?.name || "User"}
          </p>
          <p class="text-xs text-sidebar-foreground/70">
            {$auth.user?.email || "user@example.com"}
          </p>
        </div>
      </div>
      <button
        class="px-3 py-2 text-sm text-sidebar-foreground hover:text-sidebar-primary"
        on:click={handleLogout}
      >
        Logout
      </button>
    </div>
  </div>
</div>
