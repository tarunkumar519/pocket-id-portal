<script lang="ts">
    import { auth } from "$lib/stores/auth.store";
    import { config, type UserConfig } from "$lib/stores/portal-config.store";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Separator } from "$lib/components/ui/separator";
    import { env } from "$env/dynamic/public";
    import * as Select from "$lib/components/ui/select/index.js";
    import { Badge } from "$lib/components/ui/badge";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
    import type { UserGroup } from "$lib/types";

    interface Props {
        // Get data from the server load function
        data: {
            userGroups: UserGroup[];
            status: "success" | "error";
            error: string | null;
        };
    }

    let { data }: Props = $props();

    // User profile data
    let user = $derived($auth.user);

    // Get user groups from server-loaded data
    let userGroups: UserGroup[] = $derived(data.userGroups || []);
    let groupsError = $derived(data.status === "error" ? data.error : null);
    let loading = $derived(false);

    // Use the config store values
    let themePreference = $state($config.theme);
    let landingPage = $state($config.landingPage);

    // Landing page options
    const pageOptions = [
        { value: "dashboard", label: "Dashboard" },
        { value: "settings", label: "Settings" },
    ] as const;

    // Update theme preference when selected
    function updateTheme(value: UserConfig["theme"]) {
        themePreference = value;
        config.setTheme(value);
    }

    // Update landing page preference when selected
    function updateLandingPage(value: UserConfig["landingPage"]) {
        landingPage = value;
        config.setLandingPage(value);
    }

    let pageLabel = $derived(
        pageOptions.find((p) => p.value === landingPage)?.label ??
            "Select page",
    );
</script>

<svelte:head>
    <title>Settings - Pocket ID Portal</title>
</svelte:head>

<div class="space-y-6 max-w-4xl mx-auto">
    <div>
        <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
        <p class="text-sm text-muted-foreground mt-1">
            Manage your account settings and preferences
        </p>
    </div>

    <div class="grid gap-6">
        <!-- Profile Information -->
        <Card.Root>
            <Card.Header>
                <Card.Title>Profile Information</Card.Title>
                <Card.Description
                    >View your profile information from Pocket ID</Card.Description
                >
            </Card.Header>
            <Card.Content>
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm font-medium">Name</p>
                            <p class="text-sm text-muted-foreground">
                                {user?.name || "Not provided"}
                            </p>
                        </div>
                        <div>
                            <p class="text-sm font-medium">Email</p>
                            <p class="text-sm text-muted-foreground">
                                {user?.email || "Not provided"}
                            </p>
                        </div>
                    </div>

                    <!-- User Groups Section -->
                    <div>
                        <p class="text-sm font-medium mb-2">Groups</p>
                        {#if loading}
                            <p class="text-sm text-muted-foreground">
                                Loading groups...
                            </p>
                        {:else if groupsError}
                            <p class="text-sm text-red-500">
                                Error: {groupsError}
                            </p>
                        {:else if userGroups.length > 0}
                            <div class="flex flex-wrap gap-2">
                                {#each userGroups as group}
                                    <Badge variant="secondary"
                                        >{group.name}</Badge
                                    >
                                {/each}
                            </div>
                        {:else}
                            <p class="text-sm text-muted-foreground">
                                No groups assigned
                            </p>
                        {/if}
                    </div>
                </div>
            </Card.Content>
            <Card.Footer>
                <a
                    href={`${env.PUBLIC_OIDC_ISSUER}/settings/account`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button variant="default"
                        >Manage Profile in Pocket ID</Button
                    >
                </a>
            </Card.Footer>
        </Card.Root>

        <!-- Passkeys Management -->
        <Card.Root>
            <Card.Header>
                <Card.Title>Passkeys</Card.Title>
                <Card.Description
                    >Manage your passkeys for passwordless authentication</Card.Description
                >
            </Card.Header>
            <Card.Content>
                <p class="text-sm">
                    Passkeys provide a secure, passwordless way to authenticate.
                    You can register and manage your passkeys directly in Pocket
                    ID.
                </p>
            </Card.Content>
            <Card.Footer>
                <a
                    href={`${env.PUBLIC_OIDC_ISSUER}/settings/account`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button variant="default">Manage Passkeys</Button>
                </a>
            </Card.Footer>
        </Card.Root>

        <!-- Application Preferences -->
        <Card.Root>
            <Card.Header>
                <Card.Title>Portal Preferences</Card.Title>
                <Card.Description
                    >Customize your experience in the Pocket ID Portal</Card.Description
                >
            </Card.Header>
            <Card.Content>
                <div class="space-y-4">
                    <div>
                        <p class="text-sm font-medium mb-2">Theme Preference</p>
                        <RadioGroup.Root
                            class="grid max-w-xl grid-cols-3 gap-4 pt-4"
                            orientation="horizontal"
                            value={themePreference}
                            onValueChange={(value) =>
                                updateTheme(value as UserConfig["theme"])}
                        >
                            <!-- Light theme option -->
                            <Label
                                class="cursor-pointer [&:has([data-state=checked])>div]:border-primary"
                            >
                                <RadioGroup.Item
                                    value="light"
                                    class="sr-only"
                                />
                                <div
                                    class="border-muted hover:border-accent items-center rounded-md border-2 p-1"
                                >
                                    <div
                                        class="space-y-2 rounded-sm bg-[#ecedef] p-2"
                                    >
                                        <div
                                            class="space-y-2 rounded-md bg-white p-2 shadow-sm"
                                        >
                                            <div
                                                class="h-2 w-[80px] rounded-lg bg-[#ecedef]"
                                            ></div>
                                            <div
                                                class="h-2 w-[100px] rounded-lg bg-[#ecedef]"
                                            ></div>
                                        </div>
                                        <div
                                            class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm"
                                        >
                                            <div
                                                class="h-4 w-4 rounded-full bg-[#ecedef]"
                                            ></div>
                                            <div
                                                class="h-2 w-[100px] rounded-lg bg-[#ecedef]"
                                            ></div>
                                        </div>
                                        <div
                                            class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm"
                                        >
                                            <div
                                                class="h-4 w-4 rounded-full bg-[#ecedef]"
                                            ></div>
                                            <div
                                                class="h-2 w-[100px] rounded-lg bg-[#ecedef]"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <span
                                    class="block w-full p-2 text-center font-normal"
                                >
                                    Light
                                </span>
                            </Label>

                            <!-- Dark theme option -->
                            <Label
                                class="cursor-pointer [&:has([data-state=checked])>div]:border-primary"
                            >
                                <RadioGroup.Item value="dark" class="sr-only" />
                                <div
                                    class="border-muted bg-popover hover:bg-accent hover:text-accent-foreground items-center rounded-md border-2 p-1"
                                >
                                    <div
                                        class="space-y-2 rounded-sm bg-slate-950 p-2"
                                    >
                                        <div
                                            class="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm"
                                        >
                                            <div
                                                class="h-2 w-[80px] rounded-lg bg-slate-400"
                                            ></div>
                                            <div
                                                class="h-2 w-[100px] rounded-lg bg-slate-400"
                                            ></div>
                                        </div>
                                        <div
                                            class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm"
                                        >
                                            <div
                                                class="h-4 w-4 rounded-full bg-slate-400"
                                            ></div>
                                            <div
                                                class="h-2 w-[100px] rounded-lg bg-slate-400"
                                            ></div>
                                        </div>
                                        <div
                                            class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm"
                                        >
                                            <div
                                                class="h-4 w-4 rounded-full bg-slate-400"
                                            ></div>
                                            <div
                                                class="h-2 w-[100px] rounded-lg bg-slate-400"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <span
                                    class="block w-full p-2 text-center font-normal"
                                >
                                    Dark
                                </span>
                            </Label>

                            <!-- System theme option -->
                            <Label
                                class="cursor-pointer [&:has([data-state=checked])>div]:border-primary"
                            >
                                <RadioGroup.Item
                                    value="system"
                                    class="sr-only"
                                />
                                <div
                                    class="border-muted hover:border-accent items-center rounded-md border-2 p-1"
                                >
                                    <div
                                        class="space-y-2 rounded-sm bg-gradient-to-r from-[#ecedef] to-slate-950 p-2"
                                    >
                                        <div
                                            class="space-y-2 rounded-md bg-gradient-to-r from-white to-slate-800 p-2 shadow-sm"
                                        >
                                            <div
                                                class="h-2 w-[80px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400"
                                            ></div>
                                            <div
                                                class="h-2 w-[100px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400"
                                            ></div>
                                        </div>
                                        <div
                                            class="flex items-center space-x-2 rounded-md bg-gradient-to-r from-white to-slate-800 p-2 shadow-sm"
                                        >
                                            <div
                                                class="h-4 w-4 rounded-full bg-gradient-to-r from-[#ecedef] to-slate-400"
                                            ></div>
                                            <div
                                                class="h-2 w-[100px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400"
                                            ></div>
                                        </div>
                                        <div
                                            class="flex items-center space-x-2 rounded-md bg-gradient-to-r from-white to-slate-800 p-2 shadow-sm"
                                        >
                                            <div
                                                class="h-4 w-4 rounded-full bg-gradient-to-r from-[#ecedef] to-slate-400"
                                            ></div>
                                            <div
                                                class="h-2 w-[100px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <span
                                    class="block w-full p-2 text-center font-normal"
                                >
                                    System
                                </span>
                            </Label>
                        </RadioGroup.Root>
                    </div>

                    <Separator />

                    <div>
                        <p class="text-sm font-medium mb-2">
                            Default Landing Page
                        </p>
                        <Select.Root
                            type="single"
                            value={landingPage}
                            onValueChange={(value: string) =>
                                updateLandingPage(
                                    value as UserConfig["landingPage"],
                                )}
                        >
                            <Select.Trigger class="w-[180px]">
                                {pageLabel}
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Group>
                                    <Select.GroupHeading
                                        >Page</Select.GroupHeading
                                    >
                                    {#each pageOptions as option (option.value)}
                                        <Select.Item
                                            value={option.value}
                                            label={option.label}
                                        >
                                            {option.label}
                                        </Select.Item>
                                    {/each}
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>
    </div>
</div>
