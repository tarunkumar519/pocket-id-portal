<script lang="ts">
  import { page } from "$app/stores";
  import { cn } from "$lib/utils";
  import { auth } from "$lib/stores/auth";
  import { goto } from "$app/navigation";
  import { env } from "$env/dynamic/public";

  // Get the base URL from environment variables
  const baseUrl = env.PUBLIC_OIDC_ISSUER;
  const logoUrl = `${baseUrl}/api/application-configuration/logo?light=false`;

  async function handleLogout() {
    try {
      // Get the ID token from tokens in the auth store
      const idToken = $auth.tokens?.id_token || "";

      // Clear local auth state first
      auth.clearUser();

      // Properly clear all browser storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies with proper path
      document.cookie.split(";").forEach(function (c) {
        const cookie = c.trim();
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });

      // For proper OIDC logout
      const logoutUrl = `${baseUrl}/api/oidc/end-session`;
      const redirectUri = window.location.origin + "/login";

      // Include post_logout_redirect_uri and id_token_hint if available
      let logoutUrlWithParams = `${logoutUrl}?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`;
      if (idToken) {
        logoutUrlWithParams += `&id_token_hint=${encodeURIComponent(idToken)}`;
      }

      // Redirect to the OIDC provider's logout endpoint
      window.location.href = logoutUrlWithParams;
    } catch (error) {
      console.error("Error during logout:", error);

      // Clear all state again as a fallback
      auth.clearUser();
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies with proper path
      document.cookie.split(";").forEach(function (c) {
        const cookie = c.trim();
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });

      // Redirect to login page using SvelteKit navigation
      goto("/login");
    }
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
      <h1 class="text-2xl font-bold text-white">Pocket ID</h1>
    </div>
    <p class="text-sm text-muted-foreground">User Portal</p>
  </div>

  <nav class="flex-1 px-4 space-y-1">
    <a
      href="/"
      class={cn(
        "flex items-center px-4 py-2 text-sm rounded-md",
        $page.url.pathname === "/"
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
        $page.url.pathname.startsWith("/settings")
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
