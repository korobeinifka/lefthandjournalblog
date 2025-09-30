<script> 
    import Icon from '@iconify/svelte';
    import { onMount } from 'svelte';

    let theme = 'light';

    const setTheme = (nextTheme) => {
        theme = nextTheme;
        try {
            window.localStorage.setItem('theme', nextTheme);
        } catch (error) {
            // ignore storage errors
        }
        document.documentElement.setAttribute('data-theme', nextTheme);
    };

    const initialiseTheme = () => {
        try {
            const stored = window.localStorage.getItem('theme');
            if (stored === 'light' || stored === 'dark') {
                setTheme(stored);
                return;
            }
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        } catch (error) {
            setTheme('light');
        }
    };

    const toggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
    };

    onMount(() => {
        initialiseTheme();
    });
</script>

<div class="flex items-center">
    <button
        on:click={toggleTheme}
        class="flex h-10 w-10 items-center justify-center rounded-full border border-border-ink/80 bg-card-bg text-primary-text transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
        aria-label={`Activate ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
        {#if theme === 'light'}
            <Icon icon="solar:sun-2-bold" class="h-5 w-5" />
        {:else}
            <Icon icon="solar:moon-bold" class="h-5 w-5" />
        {/if}
    </button>
</div>