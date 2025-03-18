<script lang="ts">
  import { env } from "$env/dynamic/public";
  import {
    buildAuthorizationUrl,
    generateState,
    generateNonce,
  } from "$lib/auth";

  let isLoading = false;
  let errorMessage = "";

  const redirectUri = env.PUBLIC_APP_URL
    ? `${env.PUBLIC_APP_URL}/callback`
    : typeof window !== "undefined"
      ? `${window.location.origin}/callback`
      : "http://localhost:3000/callback";

  function handleLogin() {
    isLoading = true;
    errorMessage = "";

    try {
      // Generate state and nonce
      const state = generateState();
      const nonce = generateNonce();

      // Store state and nonce in sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("oidc_state", state);
        sessionStorage.setItem("oidc_nonce", nonce);
      }

      // Build authorization URL
      const authUrl = buildAuthorizationUrl(
        env.PUBLIC_OIDC_CLIENT_ID,
        redirectUri,
        "openid profile email",
        "code",
        state,
        nonce
      );

      // Redirect to authorization endpoint
      if (typeof window !== "undefined") {
        window.location.href = authUrl;
      }
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Pocket ID Portal - Login</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-background">
  <div
    class="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-sm"
  >
    <div class="text-center">
      <h1 class="text-3xl font-bold text-foreground">Pocket ID</h1>
      <p class="text-sm text-muted-foreground">User Self Service Portal</p>
    </div>

    <div class="space-y-6">
      {#if errorMessage}
        <div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      {/if}

      <button
        on:click={handleLogin}
        disabled={isLoading}
        class="w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center"
      >
        {#if isLoading}
          <div
            class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
          ></div>
        {/if}
        {isLoading ? "Connecting..." : "Login with Pocket ID"}
      </button>
    </div>
  </div>
</div>
