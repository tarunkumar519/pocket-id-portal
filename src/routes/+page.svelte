<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { config } from "$lib/stores/portal-config.store";

  onMount(() => {
    // Redirect based on preferred landing page
    if ($config.landingPage === "settings") {
      goto("/settings", { replaceState: true });
    } else {
      goto("/dashboard", { replaceState: true });
    }
  });
</script>

<div class="flex min-h-screen items-center justify-center">
  <div
    class="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
  ></div>
</div>
