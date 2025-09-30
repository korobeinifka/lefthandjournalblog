<script>
    import Icon from '@iconify/svelte';
    import { fade } from 'svelte/transition';
    let showMenu = false
    const toggleMenu = () => {
        showMenu = !showMenu
    }

    const closeMenu = () => {
        showMenu = false
    }
</script>

<div class="relative">
    <button
        on:click={toggleMenu}
        class="flex h-10 w-10 items-center justify-center rounded-full border border-border-ink/80 bg-card-bg text-primary-text transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
        aria-label={showMenu ? 'Close navigation' : 'Open navigation'}
    >
        {#if showMenu}
            <Icon icon="ri:close-line" class="h-5 w-5" />
        {:else}
            <Icon icon="ri:menu-line" class="h-5 w-5" />
        {/if}
    </button>
    {#if showMenu}
        <nav
            transition:fade={{ duration: 120 }}
            class="absolute right-0 top-12 w-56 rounded-lg border border-border-ink/80 bg-card-bg p-4 shadow-sm z-50"
        >
            <ul class="flex flex-col gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-secondary-text">
                <li>
                    <a href="/" on:click={closeMenu} class="block pb-1">
                        Home
                    </a>
                </li>
                <li>
                    <a href="/categories" on:click={closeMenu} class="block pb-1">
                        Categories
                    </a>
                </li>
                <li>
                    <a href="/about" on:click={closeMenu} class="block pb-1">
                        About
                    </a>
                </li>
            </ul>
        </nav>
    {/if}
</div>