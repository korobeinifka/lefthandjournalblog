<script lang="ts">
    import Icon from '@iconify/svelte';
    import { fade } from 'svelte/transition';
    import { CATEGORY_LINKS } from '@/utils/categories';
    import {
        fetchSearchEntries,
        filterSearchEntries,
        formatSearchDate,
        type SearchEntry,
    } from '@/utils/search';
    import { onDestroy, onMount, tick } from 'svelte';

    declare global {
        interface WindowEventMap {
            'open-mobile-search': CustomEvent<void>;
        }
    }

    const categoriesMenuId = 'mobile-category-menu';
    const categoriesButtonId = 'mobile-category-button';
    const mobileMenuId = 'mobile-navigation-menu';
    const mobileSearchTitleId = 'mobile-search-title';
    const mobileSearchDescriptionId = 'mobile-search-description';

    const mobileNavLinkClass =
        'group flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.28em] leading-none text-secondary-text transition-colors duration-200 hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text';
    const mobileCategoryLinkClass =
        'block rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-text transition-colors duration-200 hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text';

    let showMenu = false;
    let showCategories = false;
    let showSearchDrawer = false;
    let categoriesButton: HTMLButtonElement | null = null;
    let categoriesMenu: HTMLDivElement | null = null;
    let navRoot: HTMLDivElement | null = null;
    let menuButton: HTMLButtonElement | null = null;
    let searchToggleButton: HTMLButtonElement | null = null;
    let searchDialog: HTMLElement | null = null;
    let searchInput: HTMLInputElement | null = null;
    let removeDocumentListeners: (() => void) | null = null;
    let previousOverflow = '';
    let scrollLocked = false;

    let searchEntries: SearchEntry[] = [];
    let hasLoadedSearch = false;
    let isLoadingSearch = false;
    let searchError = '';
    let searchQuery = '';
    let searchShortcutLabel = 'Ctrl K';
    let previouslyFocusedElement: HTMLElement | null = null;
    let mobileFilteredResults: SearchEntry[] = [];
    let trimmedSearchQuery = '';

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

    const closeCategories = ({ restoreFocus } = { restoreFocus: true }) => {
        if (showCategories) {
            showCategories = false;
            if (restoreFocus) {
                categoriesButton?.focus();
            }
        }
    };

    const openCategories = async () => {
        showCategories = true;
        await tick();
        const firstLink = categoriesMenu?.querySelector<HTMLAnchorElement>('a');
        firstLink?.focus();
    };

    const toggleCategories = () => {
        if (showCategories) {
            closeCategories();
        } else {
            openCategories();
        }
    };

    const closeMenu = (options?: { restoreFocus?: boolean }) => {
        const { restoreFocus = true } = options ?? { restoreFocus: true };

        if (!showMenu) {
            return;
        }

        showMenu = false;
        closeCategories({ restoreFocus: false });

        if (restoreFocus) {
            menuButton?.focus();
        }
    };

    const toggleMenu = () => {
        if (showMenu) {
            closeMenu({ restoreFocus: false });
        } else {
            closeSearchDrawer({ restoreFocus: false });
            showMenu = true;
        }
    };

    const handleCategoriesKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.stopPropagation();
            closeCategories();
        }
    };

    const handleOverlayClick = () => {
        closeMenu({ restoreFocus: false });
    };

    const loadSearchIndex = async () => {
        if (hasLoadedSearch || isLoadingSearch) {
            return;
        }

        isLoadingSearch = true;
        searchError = '';

        try {
            searchEntries = await fetchSearchEntries();
            hasLoadedSearch = true;
        } catch (error) {
            searchError = 'Search is unavailable right now. Please try again later.';
        } finally {
            isLoadingSearch = false;
        }
    };

    const getSearchFocusableElements = () => {
        if (!searchDialog) {
            return [] as HTMLElement[];
        }

        const selector =
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

        return Array.from(searchDialog.querySelectorAll<HTMLElement>(selector));
    };

    const openSearchDrawer = async () => {
        previouslyFocusedElement = (document.activeElement as HTMLElement) ?? searchToggleButton;
        closeMenu({ restoreFocus: false });
        showSearchDrawer = true;
        await loadSearchIndex();
        await tick();
        if (searchInput) {
            searchInput.focus();
        } else {
            const [first] = getSearchFocusableElements();
            first?.focus();
        }
    };

    const closeSearchDrawer = (options: { restoreFocus?: boolean } = { restoreFocus: true }) => {
        if (!showSearchDrawer) {
            return;
        }

        showSearchDrawer = false;
        if (options.restoreFocus !== false) {
            const target = previouslyFocusedElement ?? searchToggleButton;
            target?.focus();
        }
        previouslyFocusedElement = null;
    };

    const handleSearchDrawerKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            closeSearchDrawer();
            return;
        }

        if (event.key !== 'Tab') {
            return;
        }

        const focusable = getSearchFocusableElements();

        if (focusable.length === 0) {
            event.preventDefault();
            return;
        }

        const activeElement = document.activeElement as HTMLElement;
        const currentIndex = focusable.indexOf(activeElement);

        if (event.shiftKey) {
            if (currentIndex <= 0) {
                event.preventDefault();
                focusable[focusable.length - 1]?.focus();
            }
            return;
        }

        if (currentIndex === -1 || currentIndex === focusable.length - 1) {
            event.preventDefault();
            focusable[0]?.focus();
        }
    };

    const handleSearchButtonClick = () => {
        if (showSearchDrawer) {
            closeSearchDrawer();
        } else {
            openSearchDrawer();
        }
    };

    const handleMobileSearchEvent = () => {
        openSearchDrawer();
    };

    onMount(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            const target = event.target as Node | null;

            if (
                showCategories &&
                !categoriesMenu?.contains(target) &&
                !categoriesButton?.contains(target as Node)
            ) {
                closeCategories({ restoreFocus: false });
            }

            if (showMenu && !navRoot?.contains(target)) {
                closeMenu({ restoreFocus: false });
            }
        };

        const handleDocumentKeydown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showSearchDrawer) {
                    event.stopPropagation();
                    closeSearchDrawer();
                } else if (showCategories) {
                    event.stopPropagation();
                    closeCategories();
                } else if (showMenu) {
                    closeMenu();
                }
            }
        };

        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('keydown', handleDocumentKeydown);

        removeDocumentListeners = () => {
            document.removeEventListener('click', handleDocumentClick);
            document.removeEventListener('keydown', handleDocumentKeydown);
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('open-mobile-search', handleMobileSearchEvent);
        }

        if (typeof navigator !== 'undefined') {
            searchShortcutLabel = navigator.platform?.includes('Mac') ? '⌘K' : 'Ctrl K';
        }
    });

    onDestroy(() => {
        removeDocumentListeners?.();
        if (typeof window !== 'undefined') {
            window.removeEventListener('open-mobile-search', handleMobileSearchEvent);
        }
        unlockScroll();
    });

    $: {
        if (showMenu || showSearchDrawer) {
            lockScroll();
        } else {
            unlockScroll();
        }
    }

    $: trimmedSearchQuery = searchQuery.trim();
    $: mobileFilteredResults = hasLoadedSearch ? filterSearchEntries(searchEntries, searchQuery) : [];
</script>

<div class="relative flex items-center gap-2" bind:this={navRoot}>
    <button
        bind:this={searchToggleButton}
        type="button"
        on:click={handleSearchButtonClick}
        class="relative z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border-ink/80 bg-card-bg text-primary-text transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
        aria-haspopup="dialog"
        aria-expanded={showSearchDrawer}
        aria-label={showSearchDrawer ? 'Close search' : 'Open search'}
    >
        <Icon icon="ri:search-line" class="pointer-events-none h-5 w-5" />
    </button>
    <button
        bind:this={menuButton}
        type="button"
        on:click={toggleMenu}
        class="relative z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border-ink/80 bg-card-bg text-primary-text transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
        aria-expanded={showMenu}
        aria-controls={mobileMenuId}
        aria-haspopup="true"
        aria-label={showMenu ? 'Close navigation' : 'Open navigation'}
    >
        {#if showMenu}
            <Icon icon="ri:close-line" class="pointer-events-none h-5 w-5" />
        {:else}
            <Icon icon="ri:menu-line" class="pointer-events-none h-5 w-5" />
        {/if}
    </button>

    {#if showMenu}
        <div
            class="fixed inset-0 z-40 bg-primary-bg/70 backdrop-blur-sm"
            transition:fade={{ duration: 120 }}
            aria-hidden="true"
            on:click={handleOverlayClick}
        ></div>
        <nav
            id={mobileMenuId}
            aria-label="Mobile navigation"
            transition:fade={{ duration: 120 }}
            class="absolute right-0 top-12 z-50 w-64 max-w-[85vw] rounded-2xl border border-border-ink/80 bg-card-bg p-4 shadow-xl"
        >
            <ul class="flex flex-col gap-2 text-secondary-text">
                <li>
                    <a href="/" on:click={closeMenu} class={mobileNavLinkClass}>
                        <span>Home</span>
                        <Icon icon="ri:arrow-right-up-line" class="h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    </a>
                </li>
                <li class="relative">
                    <button
                        id={categoriesButtonId}
                        bind:this={categoriesButton}
                        class={`${mobileNavLinkClass} ${showCategories ? 'text-primary-text' : ''}`}
                        type="button"
                        on:click|stopPropagation={toggleCategories}
                        on:keydown={handleCategoriesKeydown}
                        aria-expanded={showCategories}
                        aria-controls={categoriesMenuId}
                    >
                        <span>CATEGORY</span>
                        <Icon icon={showCategories ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'} class="h-4 w-4" />
                    </button>
                    {#if showCategories}
                        <div
                            bind:this={categoriesMenu}
                            id={categoriesMenuId}
                            class="mt-2 rounded-xl border border-border-ink/80 bg-card-bg py-3 shadow-sm"
                            role="menu"
                            aria-labelledby={categoriesButtonId}
                            tabindex="-1"
                            on:keydown={handleCategoriesKeydown}
                        >
                            <ul class="flex flex-col gap-1 text-secondary-text">
                                {#each CATEGORY_LINKS as category}
                                    <li>
                                        <a
                                            href={`/categories/${category.slug}`}
                                            class={mobileCategoryLinkClass}
                                            on:click={closeMenu}
                                            role="menuitem"
                                        >
                                            {category.label}
                                        </a>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                </li>
                <li>
                    <a href="/about" on:click={closeMenu} class={mobileNavLinkClass}>
                        <span>About</span>
                        <Icon icon="ri:arrow-right-up-line" class="h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    </a>
                </li>
            </ul>
        </nav>
    {/if}

    {#if showSearchDrawer}
        <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-6">
            <div
                class="absolute inset-0 bg-primary-bg/80 backdrop-blur-sm"
                aria-hidden="true"
                on:click={() => closeSearchDrawer({ restoreFocus: false })}
            ></div>
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby={mobileSearchTitleId}
                aria-describedby={mobileSearchDescriptionId}
                bind:this={searchDialog}
                on:keydown={handleSearchDrawerKeydown}
                class="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-border-ink/80 bg-card-bg shadow-2xl max-h-[calc(100vh-3rem)]"
            >
                <header class="flex items-center justify-between border-b border-border-ink/70 bg-surface-bg/80 px-5 py-4">
                    <div class="flex flex-col">
                        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-muted-text">Search</p>
                        <h2 id={mobileSearchTitleId} class="text-lg font-display text-primary-text">Find a dispatch</h2>
                    </div>
                    <button
                        type="button"
                        class="flex h-9 w-9 items-center justify-center rounded-full border border-border-ink/70 text-secondary-text transition-colors nav-transition hover:text-primary-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
                        on:click={() => closeSearchDrawer()}
                        aria-label="Close search"
                    >
                        <Icon icon="ri:close-line" class="h-4 w-4" />
                    </button>
                </header>
                <div class="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
                    <p id={mobileSearchDescriptionId} class="sr-only">
                        Search the Lefthand Journal archive. Type a query and use Tab to move between search controls and results.
                    </p>
                    <div class="flex items-center gap-3 rounded-2xl border border-border-ink/70 bg-card-bg px-4 py-3 shadow-sm">
                        <Icon icon="ri:search-line" class="h-5 w-5 text-secondary-text" />
                        <label class="sr-only" for="mobile-search-input">Search posts</label>
                        <input
                            id="mobile-search-input"
                            bind:this={searchInput}
                            bind:value={searchQuery}
                            type="search"
                            inputmode="search"
                            placeholder="Search topics, words, or posts"
                            class="flex-1 bg-transparent text-base text-primary-text placeholder:text-muted-text focus:outline-none"
                            autocomplete="off"
                            spellcheck="false"
                        />
                        <span class="rounded-lg border border-border-ink/60 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-text">
                            {searchShortcutLabel}
                        </span>
                    </div>
                    {#if searchError}
                        <p class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {searchError}
                        </p>
                    {:else if isLoadingSearch}
                        <p class="px-1 text-sm text-secondary-text">Loading search index…</p>
                    {:else if mobileFilteredResults.length === 0}
                        <p class="px-1 text-sm text-secondary-text">
                            {trimmedSearchQuery ? 'No posts match your search yet.' : 'Start typing to explore the archive.'}
                        </p>
                    {:else}
                        <ul class="flex flex-col gap-3 pr-1">
                            {#each mobileFilteredResults as result}
                                <li>
                                    <a
                                        href={result.url}
                                        class="block rounded-2xl border border-transparent px-4 py-3 transition-colors nav-transition hover:border-border-ink/70 hover:bg-surface-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text"
                                        on:click={() => closeSearchDrawer({ restoreFocus: false })}
                                    >
                                        <div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-text">
                                            <span>{result.category}</span>
                                            {#if result.pubDate}
                                                <span aria-hidden="true">•</span>
                                                <span>{formatSearchDate(result.pubDate)}</span>
                                            {/if}
                                        </div>
                                        <p class="mt-2 font-display text-lg text-primary-text">{result.title}</p>
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
</div>
