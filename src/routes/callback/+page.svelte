<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { storeAuthState } from "$lib/auth";
  import { auth } from "$lib/stores/auth";

  export let data;

  let isLoading = true;
  let errorMessage = "";

  onMount(() => {
    if (data.success) {
      try {
        // First store auth state in localStorage
        if (data.tokens && data.userInfo) {
          storeAuthState(data.tokens, data.userInfo);

          // Set a dedicated user_id cookie for easier server-side access
          if (data.userInfo.sub) {
            const longMaxAge = 30 * 24 * 60 * 60; // 30 days in seconds
            const domain = window.location.hostname;

            document.cookie = `user_id=${data.userInfo.sub}; path=/; max-age=${longMaxAge}; domain=${domain}; SameSite=Lax`;
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
          goto("/");
        }, 500);
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
  <div
    class="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-sm"
  >
    <div class="text-center">
      <h1 class="text-2xl font-bold text-foreground">Pocket ID</h1>
      <p class="text-sm text-muted-foreground">OIDC Portal Admin</p>
    </div>

    <div class="space-y-6">
      {#if isLoading}
        <div class="flex flex-col items-center justify-center space-y-4">
          <div
            class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          ></div>
          <p class="text-sm text-muted-foreground">
            Processing authentication...
          </p>
        </div>
      {:else if errorMessage}
        <div class="space-y-4">
          <div
            class="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
          >
            {errorMessage}
          </div>
          <button
            class="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            on:click={() => goto("/login")}
          >
            Back to Login
          </button>
        </div>
      {:else if data.success}
        <div class="flex flex-col items-center justify-center space-y-4">
          <div class="rounded-full bg-green-100 p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p class="text-center text-sm text-muted-foreground">
            Authentication successful! Redirecting...
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>
