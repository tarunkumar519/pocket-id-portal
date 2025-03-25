<script lang="ts">
  import { Home, Library, Cog, type Icon as IconType } from "@lucide/svelte";

  interface Props {
    title: string;
    description?: string;
    icon: typeof IconType;
    actions?: () => any;
  }

  let {
    actions,
    title = $bindable("Page Title"),
    description = $bindable(""),
    icon = $bindable(),
  }: Props = $props();
</script>

<div
  class="rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 p-8 border shadow-sm animate-fade-in"
>
  <div
    class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
  >
    <div class="space-y-2">
      <div class="flex items-center gap-3">
        <div class="bg-primary/10 p-2 rounded-full">
          {#if icon}{@const Icon = icon}
            <Icon class="h-6 w-6 text-primary" />
          {/if}
        </div>
        <h1 class="text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      {#if description}
        <p class="text-muted-foreground max-w-lg">
          {description}
        </p>
      {/if}
    </div>
    {#if actions}{@render actions()}{:else}
      <!-- Optional slot for buttons or other actions -->
    {/if}
  </div>
</div>
