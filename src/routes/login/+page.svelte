<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { getLogoUrl } from "$lib/utils/oidc-urls.util";
  import { ApplicationConfigurationService } from "$lib/services/application-configuration-service";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { resource, watch } from "runed";
  import {
    buildAuthorizationUrl,
    generateState,
    generateNonce,
  } from "$lib/auth";

  // Get return URL from query parameter (works with SSR)
  const returnUrl = $page.url.searchParams.get("returnUrl") || "/";

  // State variables
  let isLoading = $state(false);
  let errorMessage = $state("");

  // These can be initialized during SSR
  const logoUrl = getLogoUrl(env.PUBLIC_OIDC_ISSUER);
  const staticBackgroundPath = "/background.jpg";

  // Use resource for background image loading
  const backgroundResource = resource.pre(
    () => browser, // Only activate when in browser
    async () => {
      try {
        // Try to load dynamic background
        const dynamicBg =
          await ApplicationConfigurationService.fetchBackgroundImage();
        if (dynamicBg) return { url: dynamicBg, source: "dynamic" };

        // Check if static fallback exists
        const fallbackExists = await checkImageExists(staticBackgroundPath);
        if (fallbackExists)
          return { url: staticBackgroundPath, source: "static" };

        // No images available
        return { url: null, source: "none" };
      } catch (error) {
        console.warn("Failed to load background:", error);
        return { url: null, source: "error" };
      }
    }
  );

  // Compute redirect URI (SSR safe)
  const redirectUri = env.PUBLIC_APP_URL
    ? `${env.PUBLIC_APP_URL}/callback`
    : browser
      ? `${window.location.origin}/callback`
      : "http://localhost:3000/callback";

  // Helper to check if an image exists
  async function checkImageExists(url: string): Promise<boolean> {
    if (!browser) return false;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  // Store return URL when component mounts
  onMount(() => {
    if (browser && returnUrl !== "/") {
      sessionStorage.setItem("returnUrl", returnUrl);
    }
  });

  // Handle login action
  function handleLogin() {
    isLoading = true;
    errorMessage = "";

    try {
      if (!browser) {
        throw new Error("Login is only available in browser");
      }

      // Generate state and nonce
      const state = generateState();
      const nonce = generateNonce();

      // Store state and nonce in sessionStorage
      sessionStorage.setItem("oidc_state", state);
      sessionStorage.setItem("oidc_nonce", nonce);

      // Build authorization URL
      const authUrl = buildAuthorizationUrl(
        env.PUBLIC_OIDC_CLIENT_ID,
        redirectUri,
        "openid profile email",
        "code",
        state,
        nonce
      );

      // Use goto for client-side navigation
      window.location.href = authUrl;
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      isLoading = false;
    }
  }

  // Get background style based on resource state
  const getBackgroundStyle = () => {
    if (!backgroundResource || !backgroundResource.current?.url) {
      return "background: linear-gradient(to bottom right, #6d28d9, #4c1d95, #000);";
    }
    return `background-image: url(${backgroundResource.current?.url}); background-size: cover; background-position: center;`;
  };
</script>

<svelte:head>
  <title>Login - Pocket ID Portal</title>
</svelte:head>

<div class="flex min-h-screen">
  <!-- Left Section - Login Form -->
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

  <!-- Right Section - Background Image -->
  <div
    class="hidden md:block h-screen w-1/2 lg:w-[calc(100vw-650px)] rounded-l-[60px]"
    style={getBackgroundStyle()}
  >
    <!-- Show fallback design when no images are available -->
    {#if backgroundResource?.current?.source === "none" || backgroundResource?.current?.source === "error"}
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
