<script lang="ts">
    import Icon from '@iconify/svelte';
    import { onDestroy, onMount, tick } from 'svelte';

    type SearchEntry = {
        title: string;
        description: string;
        category: string;
        url: string;
        excerpt: string;
        pubDate: string;
        searchField: string;
    };

    let theme: 'light' | 'dark' = 'light';
    let searchOpen = false;
    let searchEntries: SearchEntry[] = [];
    let hasLoadedSearch = false;
    let isLoadingSearch = false;
    let searchError = '';
    let searchQuery = '';
    let searchInput: HTMLInputElement | null = null;
    let searchButton: HTMLButtonElement | null = null;
    let shortcutLabel = 'Ctrl K';
    let previousOverflow = '';
    let scrollLocked = false;

    const lockScroll = () => {
        if (typeof document === 'undefined' || scrollLocked) {
            return;
        }

        previousOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        scrollLocked = true;
    };

    const unlockScroll = () => {
        if (typeof document === 'undefined' || !scrollLocked) {
            return;
        }

        document.documentElement.style.overflow = previousOverflow;
        scrollLocked = false;
    };

    const setTheme = (nextTheme: 'light' | 'dark') => {
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

    const loadSearchIndex = async () => {
        if (hasLoadedSearch || isLoadingSearch) {
            return;
        }

        isLoadingSearch = true;
        searchError = '';

        try {
            const response = await fetch('/search.json', {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Unable to fetch search index');
            }

            const data: SearchEntry[] = await response.json();
            searchEntries = data;
            hasLoadedSearch = true;
        } catch (error) {
            searchError = 'Search is unavailable right now. Please try again later.';
        } finally {
            isLoadingSearch = false;
        }
    };

    const openSearch = async () => {
        searchOpen = true;
        await loadSearchIndex();
        await tick();
        searchInput?.focus();
    };

    const closeSearch = (options: { restoreFocus?: boolean } = { restoreFocus: true }) => {
        if (!searchOpen) {
            return;
        }

        searchOpen = false;
        if (options.restoreFocus !== false) {
            searchButton?.focus();
        }
    };

    const handleSearchKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            closeSearch();
        }
    };

    const formatDate = (value: string) => {
        const date = new Date(value);
        if (Number.isNaN(date.valueOf())) {
            return '';
        }
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleGlobalKeydown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && (event.key === 'k' || event.key === 'K')) {
            event.preventDefault();
            if (searchOpen) {
                closeSearch();
            } else {
                openSearch();
            }
            return;
        }

        if (event.key === 'Escape' && searchOpen) {
            closeSearch();
        }
    };

    onMount(() => {
        initialiseTheme();
        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', handleGlobalKeydown);
        }
        if (typeof navigator !== 'undefined') {
            shortcutLabel = navigator.platform?.includes('Mac') ? '⌘K' : 'Ctrl K';
        }
    });

    onDestroy(() => {
        if (typeof document !== 'undefined') {
            document.removeEventListener('keydown', handleGlobalKeydown);
        }
        unlockScroll();
    });

    $: {
        if (searchOpen) {
            lockScroll();
        } else {
            unlockScroll();
        }
    }

    $: trimmedQuery = searchQuery.trim().toLowerCase();
    $: filteredResults = hasLoadedSearch
        ? (trimmedQuery
              ? searchEntries.filter((entry) => entry.searchField.includes(trimmedQuery)).slice(0, 12)
              : searchEntries.slice(0, 6))
        : [];

    const handleSearchButtonClick = () => {
        if (searchOpen) {
            closeSearch();
        } else {
            openSearch();
        }
    };
</script>

<div class="flex items-center gap-2">
    <button
        bind:this={searchButton}
        type="button"
        on:click={handleSearchButtonClick}
        class="flex h-10 w-10 items-center justify-center rounded-full border border-border-ink/80 bg-card-bg text-primary-text transition-colors nav-transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
        aria-label={searchOpen ? 'Close search' : 'Open search'}
        aria-expanded={searchOpen}
        aria-haspopup="dialog"
    >
        <Icon icon="ri:search-line" class="h-5 w-5" />
    </button>
    <button
        on:click={toggleTheme}
        class="flex h-10 w-10 items-center justify-center rounded-full border border-border-ink/80 bg-card-bg text-primary-text transition-colors nav-transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
        aria-label={`Activate ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
        {#if theme === 'light'}
            <Icon icon="solar:sun-2-bold" class="h-5 w-5" />
        {:else}
            <Icon icon="solar:moon-bold" class="h-5 w-5" />
        {/if}
    </button>
</div>

{#if searchOpen}
    <div class="fixed inset-0 z-50 flex items-start justify-center px-4 py-24 sm:py-32">
        <div
            class="absolute inset-0 bg-primary-bg/80 backdrop-blur-sm"
            on:click={() => closeSearch({ restoreFocus: false })}
        ></div>
        <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-search-title"
            class="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-border-ink/80 bg-card-bg shadow-2xl"
        >
            <header class="flex items-center justify-between border-b border-border-ink/70 bg-surface-bg/80 px-6 py-4">
                <div class="flex flex-col">
                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-muted-text">Search</p>
                    <h2 id="global-search-title" class="text-lg font-display text-primary-text">Find a dispatch</h2>
                </div>
                <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-full border border-border-ink/70 text-secondary-text transition-colors nav-transition hover:text-primary-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
                    on:click={() => closeSearch()}
                    aria-label="Close search"
                >
                    <Icon icon="ri:close-line" class="h-4 w-4" />
                </button>
            </header>
            <div class="flex flex-col gap-5 px-6 py-6">
                <div class="flex items-center gap-3 rounded-2xl border border-border-ink/70 bg-card-bg px-4 py-3 shadow-sm">
                    <Icon icon="ri:search-line" class="h-5 w-5 text-secondary-text" />
                    <label class="sr-only" for="global-search-input">Search posts</label>
                    <input
                        id="global-search-input"
                        bind:this={searchInput}
                        bind:value={searchQuery}
                        type="search"
                        inputmode="search"
                        placeholder="Search topics, words, or posts"
                        class="flex-1 bg-transparent text-base text-primary-text placeholder:text-muted-text focus:outline-none"
                        on:keydown={handleSearchKeydown}
                        autocomplete="off"
                        spellcheck="false"
                    />
                    <span class="hidden rounded-lg border border-border-ink/60 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-text sm:block">
                        {shortcutLabel}
                    </span>
                </div>
                {#if searchError}
                    <p class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {searchError}
                    </p>
                {:else if isLoadingSearch}
                    <p class="px-1 text-sm text-secondary-text">Loading search index…</p>
                {:else if filteredResults.length === 0}
                    <p class="px-1 text-sm text-secondary-text">
                        {trimmedQuery ? 'No posts match your search yet.' : 'Start typing to explore the archive.'}
                    </p>
                {:else}
                    <ul class="flex max-h-[22rem] flex-col gap-3 overflow-y-auto pr-1">
                        {#each filteredResults as result}
                            <li>
                                <a
                                    href={result.url}
                                    class="block rounded-2xl border border-transparent px-4 py-3 transition-colors nav-transition hover:border-border-ink/70 hover:bg-surface-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text"
                                    on:click={() => closeSearch({ restoreFocus: false })}
                                >
                                    <div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-text">
                                        <span>{result.category}</span>
                                        {#if result.pubDate}
                                            <span aria-hidden="true">•</span>
                                            <span>{formatDate(result.pubDate)}</span>
                                        {/if}
                                    </div>
                                    <p class="mt-2 font-display text-xl text-primary-text">{result.title}</p>
                                    <p class="mt-1 text-sm text-secondary-text">{result.excerpt}</p>
                                </a>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </div>
        </section>
    </div>
{/if}
