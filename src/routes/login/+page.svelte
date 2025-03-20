<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { getLogoUrl } from "$lib/utils/oidc-urls.util";
  import { ApplicationConfigurationService } from "$lib/services/application-configuration-service";
  import { onMount } from "svelte";
  import {
    buildAuthorizationUrl,
    generateState,
    generateNonce,
  } from "$lib/auth";

  let isLoading = $state(false);
  let errorMessage = $state("");
  let backgroundImageUrl: string | null = $state(null);

  // Generate the logo URL using the utility function
  const logoUrl = getLogoUrl(env.PUBLIC_OIDC_ISSUER);

  const redirectUri = env.PUBLIC_APP_URL
    ? `${env.PUBLIC_APP_URL}/callback`
    : typeof window !== "undefined"
      ? `${window.location.origin}/callback`
      : "http://localhost:3000/callback";

  // Only fetch the background image on the client side
  onMount(async () => {
    try {
      backgroundImageUrl =
        await ApplicationConfigurationService.fetchBackgroundImage();
    } catch (error) {
      console.warn("Failed to load background image:", error);
    }
  });

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

<div class="flex min-h-screen">
  <!-- Left Section -->
  <div
    class="flex flex-col justify-center items-center w-full md:w-1/2 bg-background p-8 space-y-6 animate-fade-in"
  >
    <div class="text-center">
      <img
        src={logoUrl}
        alt="Pocket ID Logo"
        class="h-12 w-auto mx-auto mb-4"
      />
      <h1 class="text-4xl font-bold text-foreground">Pocket ID Portal</h1>
      <p class="text-sm text-muted-foreground">
        Authenticate with your Pocket ID to access the user portal.
      </p>
    </div>

    <div class="space-y-6 w-full max-w-sm">
      {#if errorMessage}
        <div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      {/if}

      <button
        onclick={handleLogin}
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

  <!-- Right Section -->
  <div
    class=" h-screen w-[calc(100vw-650px)] rounded-l-[60px] object-cover"
    style="background-image: url({backgroundImageUrl ||
      ''}); background-size: cover; background-position: center;"
  >
    <!-- Background graphic - shown only when background image is not available -->
    {#if !backgroundImageUrl}
      <div
        class="absolute inset-0 bg-gradient-to-br from-purple-700 via-indigo-800 to-black"
      ></div>
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="relative">
          <div
            class="w-64 h-64 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 blur-3xl opacity-50"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-white text-6xl font-bold">🚀</div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.8s ease-out forwards;
  }
</style>
