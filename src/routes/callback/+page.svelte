<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { storeAuthState } from "$lib/auth";
  import { auth } from "$lib/stores/auth.store.js";
  import { env } from "$env/dynamic/public";
  import { getLogoUrl } from "$lib/utils/oidc-urls.util";
  import { CheckCircle, AlertCircle, Loader2 } from "@lucide/svelte";

  // Get logo URL using the utility function
  const logoUrl = getLogoUrl(env.PUBLIC_OIDC_ISSUER);

  let { data } = $props();
  let isLoading = $state(true);
  let errorMessage = $state("");
  let redirectUrl = $state("/");

  onMount(() => {
    if (data.success) {
      try {
        // First store auth state in localStorage
        if (data.tokens && data.userInfo) {
          storeAuthState(data.tokens, data.userInfo);

          // Get the return URL from session storage if available
          if (typeof sessionStorage !== "undefined") {
            const returnUrl = sessionStorage.getItem("returnUrl");
            if (returnUrl) {
              redirectUrl = returnUrl;
              sessionStorage.removeItem("returnUrl");
            }
          }

          // Set a dedicated user_id cookie for easier server-side access
          if (data.userInfo.sub) {
            const longMaxAge = 30 * 24 * 60 * 60; // 30 days in seconds
            const domain = window.location.hostname;

            // Make sure the cookies are properly formatted
            document.cookie = `user_id=${data.userInfo.sub}; path=/; max-age=${longMaxAge}; domain=${domain}; SameSite=Lax`;

            // Set the auth_session cookie which the server uses to check auth status
            document.cookie = `auth_session=true; path=/; max-age=${longMaxAge}; domain=${domain}; SameSite=Lax`;

            console.log(
              `Set user_id cookie with domain ${domain} and 30-day expiration:`,
              data.userInfo.sub
            );
          }
        } else {
          throw new Error("Missing tokens or user info");
        }

        // Then update the auth store
        auth.setUser(data.userInfo, data.tokens);

        // Clear state and nonce from sessionStorage
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem("oidc_state");
          sessionStorage.removeItem("oidc_nonce");
        }

        console.log("Authentication successful, redirecting to dashboard");

        // Redirect to dashboard with a slight delay to ensure state is updated
        setTimeout(() => {
          goto(redirectUrl);
        }, 1000); // Slightly longer delay to ensure cookies are properly set
      } catch (error) {
        console.error("Error storing auth state:", error);
        errorMessage = "Error storing authentication data";
      }
    } else {
      errorMessage = data.error || "Authentication failed";
    }
    isLoading = false;
  });
</script>

<div class="flex min-h-screen items-center justify-center bg-background">
  <div class="w-full max-w-md">
    <!-- Card with subtle shadow and border -->
    <div
      class="rounded-xl border bg-card shadow-sm p-8 animate-fade-in"
      style="animation-delay: 100ms;"
    >
      <!-- Logo and app name section -->
      <div class="flex items-center justify-center gap-3 mb-6">
        <div class="bg-primary/10 p-2.5 rounded-lg">
          <img src={logoUrl} alt="Pocket ID Logo" class="h-8 w-auto" />
        </div>
        <div class="text-center">
          <h1 class="text-2xl font-bold">Pocket ID</h1>
          <p class="text-xs text-muted-foreground">User Portal</p>
        </div>
      </div>

      <div class="space-y-6">
        {#if isLoading}
          <!-- Loading state -->
          <div
            class="flex flex-col items-center justify-center py-8 space-y-4 animate-fade-in"
          >
            <div class="relative">
              <!-- Pulsing background -->
              <div
                class="absolute inset-0 rounded-full bg-primary/10 animate-pulse"
              ></div>
              <!-- Spinner -->
              <div class="relative p-4">
                <Loader2 class="size-8 text-primary animate-spin" />
              </div>
            </div>
            <div class="text-center">
              <p class="font-medium text-sm">Verifying your identity</p>
              <p class="text-xs text-muted-foreground mt-1">
                Please wait while we process your authentication...
              </p>
            </div>
          </div>
        {:else if errorMessage}
          <!-- Error state -->
          <div class="space-y-4 animate-fade-in">
            <div
              class="flex items-center gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20"
            >
              <div class="bg-destructive/10 p-2 rounded-full shrink-0">
                <AlertCircle class="size-5 text-destructive" />
              </div>
              <div>
                <p class="font-medium text-sm">Authentication Failed</p>
                <p class="text-xs text-muted-foreground mt-1">{errorMessage}</p>
              </div>
            </div>
            <button
              class="w-full mt-4 rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              onclick={() => goto("/login")}
            >
              Back to Login
            </button>
          </div>
        {:else if data.success}
          <!-- Success state -->
          <div
            class="flex flex-col items-center justify-center py-8 space-y-4 animate-fade-in"
          >
            <div class="relative">
              <!-- Success background glow -->
              <div
                class="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/30"
              ></div>
              <div class="relative p-4">
                <CheckCircle
                  class="size-8 text-green-600 dark:text-green-400"
                />
              </div>
            </div>
            <div class="text-center space-y-1">
              <p class="font-medium">Authentication Successful!</p>
              <p class="text-sm text-muted-foreground">
                Welcome back{data.userInfo?.name
                  ? `, ${data.userInfo.name}`
                  : ""}!
              </p>
              <p class="text-xs text-muted-foreground mt-2">
                Redirecting you to your dashboard...
              </p>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Decorative element -->
    <div class="flex justify-center mt-6">
      <div class="text-xs text-muted-foreground flex items-center gap-1.5">
        <div class="h-px w-8 bg-muted"></div>
        Secure Authentication
        <div class="h-px w-8 bg-muted"></div>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.8s ease-out forwards;
    opacity: 0;
  }
</style>
