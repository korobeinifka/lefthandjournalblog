<script lang="ts">
    import Icon from '@iconify/svelte';
    import { fade, fly } from 'svelte/transition';
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

    const mobileMenuTitleId = 'mobile-navigation-title';

    const mobileSearchTitleId = 'mobile-search-title';
    const mobileSearchDescriptionId = 'mobile-search-description';


    const mobileNavLinkClass =
        'group flex w-full items-center justify-between rounded-xl px-5 py-4 text-left text-base font-semibold uppercase tracking-[0.25em] text-secondary-text transition-colors duration-200 hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text';
    const mobileCategoryLinkClass =
        'block rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-secondary-text transition-colors duration-200 hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text';

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
    let menuPanel;
    let searchInput;
    let focusableElements = [];
    let pointerStartY = null;
    let pointerActive = false;

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
            tick().then(updateFocusableElements);
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
        updateFocusableElements();
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


    const updateFocusableElements = () => {
        if (!menuPanel) {
            focusableElements = [];
            return;
        }

        focusableElements = Array.from(
            menuPanel.querySelectorAll(
                'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            )
        ).filter((element) => !element.hasAttribute('disabled'));
    };

    const focusFirstElement = () => {
        if (searchInput) {
            searchInput.focus();
            return;
        }

        const [firstElement] = focusableElements;
        firstElement?.focus();
    };

    const handleMenuKeydown = (event) => {
        if (!showMenu) {
            return;
        }

        if (event.key === 'Tab') {
            if (focusableElements.length === 0) {
                event.preventDefault();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            const activeElement = document.activeElement;

            if (event.shiftKey) {
                if (activeElement === firstElement) {
                    event.preventDefault();
                    lastElement?.focus();
                }
            } else if (activeElement === lastElement) {
                event.preventDefault();
                firstElement?.focus();
            }
        }
    };

    const handlePointerDown = (event) => {
        if (!showMenu) {
            return;
        }

        const clientY = event.clientY ?? event.touches?.[0]?.clientY ?? null;
        const pointerType = event.pointerType ?? (event.touches ? 'touch' : '');

        if (pointerType !== 'touch' && pointerType !== 'pen' && !event.touches) {
            pointerActive = false;
            pointerStartY = null;
            return;
        }

        const panelTop = menuPanel?.getBoundingClientRect()?.top ?? 0;

        if (clientY === null || clientY - panelTop > 96) {
            pointerActive = false;
            pointerStartY = null;
            return;
        }

        pointerActive = true;
        pointerStartY = clientY;
    };

    const handlePointerMove = (event) => {
        if (!pointerActive || pointerStartY === null) {
            return;
        }

        const currentY = event.clientY ?? event.touches?.[0]?.clientY ?? null;

        if (currentY === null) {
            return;
        }

        const deltaY = currentY - pointerStartY;

        if (deltaY > 80) {
            pointerActive = false;
            pointerStartY = null;
            closeMenu({ restoreFocus: false });
        }
    };

    const handlePointerUp = () => {
        pointerActive = false;
        pointerStartY = null;
    };

    const handleCategoriesKeydown = (event) => {
=======
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

        const handleDocumentFocus = (event) => {
            if (!showMenu || !menuPanel) {
                return;
            }

            if (!menuPanel.contains(event.target)) {
                event.stopPropagation();
                focusFirstElement();
            }
        };

        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('keydown', handleDocumentKeydown);
        document.addEventListener('focus', handleDocumentFocus, true);

        removeDocumentListeners = () => {
            document.removeEventListener('click', handleDocumentClick);
            document.removeEventListener('keydown', handleDocumentKeydown);
            document.removeEventListener('focus', handleDocumentFocus, true);
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


    $: if (showMenu) {
        tick().then(() => {
            updateFocusableElements();
            focusFirstElement();
        });
    }
=======
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
        <div
            bind:this={menuPanel}
            id={mobileMenuId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={mobileMenuTitleId}
            class="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-card-bg"
            tabindex="-1"
            transition:fly={{ y: -32, duration: 180, easing: (t) => t * t }}
            on:keydown={handleMenuKeydown}
            on:pointerdown={handlePointerDown}
            on:pointermove={handlePointerMove}
            on:pointerup={handlePointerUp}
            on:pointercancel={handlePointerUp}
        >
            <header class="sticky top-0 z-[1] flex flex-col gap-4 bg-card-bg/95 px-6 pt-6 pb-4 backdrop-blur">
                <div class="flex items-start justify-between gap-4">
                    <h2 id={mobileMenuTitleId} class="text-xl font-semibold uppercase tracking-[0.3em] text-primary-text">
                        Menu
                    </h2>
                    <button
                        type="button"
                        class="flex items-center gap-2 rounded-full border border-border-ink/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-secondary-text transition-colors duration-200 hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text"
                        on:click={() => closeMenu()}
                    >
                        <Icon icon="ri:close-line" class="h-5 w-5" />
                        <span>Close</span>
                    </button>
                </div>
                <label class="relative flex items-center rounded-full border border-border-ink/80 bg-surface/90 px-5 py-3 shadow-sm focus-within:border-primary-text">
                    <Icon icon="ri:search-line" class="mr-3 h-5 w-5 text-secondary-text" />
                    <span class="sr-only">Search</span>
                    <input
                        bind:this={searchInput}
                        type="search"
                        name="mobile-search"
                        placeholder="Search..."
                        class="w-full border-none bg-transparent text-base text-primary-text placeholder:text-secondary-text focus:outline-none"
                    />
                </label>
            </header>
            <nav aria-label="Mobile navigation" class="flex flex-1 flex-col px-2 pb-12 pt-4">
                <ul class="flex flex-col gap-3 text-secondary-text">
                    <li>
                        <a href="/" on:click={closeMenu} class={mobileNavLinkClass}>
                            <span>Home</span>
                            <Icon icon="ri:arrow-right-up-line" class="h-5 w-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
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
                            aria-haspopup="true"
                        >
                            <span>CATEGORY</span>
                            <Icon icon={showCategories ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'} class="h-5 w-5" />
                        </button>
                        {#if showCategories}
                            <div
                                bind:this={categoriesMenu}
                                id={categoriesMenuId}
                                class="mt-2 rounded-2xl border border-border-ink/80 bg-card-bg px-2 py-3 shadow-sm"
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
                            <Icon icon="ri:arrow-right-up-line" class="h-5 w-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
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
