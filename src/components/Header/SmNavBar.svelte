<script>
    import Icon from '@iconify/svelte';
    import { fade, fly } from 'svelte/transition';
    import { CATEGORY_LINKS } from '@/utils/categories';
    import { onDestroy, onMount, tick } from 'svelte';

    const categoriesMenuId = 'mobile-category-menu';
    const categoriesButtonId = 'mobile-category-button';
    const mobileMenuId = 'mobile-navigation-menu';
    const mobileMenuTitleId = 'mobile-navigation-title';

    const mobileNavLinkClass =
        'group flex w-full items-center justify-between rounded-xl px-5 py-4 text-left text-base font-semibold uppercase tracking-[0.25em] text-secondary-text transition-colors duration-200 hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text';
    const mobileCategoryLinkClass =
        'block rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-secondary-text transition-colors duration-200 hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text';

    let showMenu = false;
    let showCategories = false;
    let categoriesButton;
    let categoriesMenu;
    let navRoot;
    let menuButton;
    let removeDocumentListeners = null;
    let previousOverflow = '';
    let scrollLocked = false;
    let menuPanel;
    let searchInput;
    let focusableElements = [];
    let pointerStartY = null;
    let pointerActive = false;

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
        const firstLink = categoriesMenu?.querySelector('a');
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

    const toggleMenu = () => {
        if (showMenu) {
            closeMenu({ restoreFocus: false });
        } else {
            showMenu = true;
        }
    };

    const closeMenu = (options) => {
        const { restoreFocus = true } =
            options && typeof options === 'object' && 'restoreFocus' in options
                ? options
                : { restoreFocus: true };

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
        if (event.key === 'Escape') {
            event.stopPropagation();
            closeCategories();
        }
    };

    const handleOverlayClick = () => {
        closeMenu({ restoreFocus: false });
    };

    onMount(() => {
        const handleDocumentClick = (event) => {
            const target = event.target;

            if (
                showCategories &&
                !categoriesMenu?.contains(target) &&
                !categoriesButton?.contains(target)
            ) {
                closeCategories({ restoreFocus: false });
            }

            if (showMenu && !navRoot?.contains(target)) {
                closeMenu({ restoreFocus: false });
            }
        };

        const handleDocumentKeydown = (event) => {
            if (event.key === 'Escape') {
                if (showCategories) {
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
    });

    onDestroy(() => {
        removeDocumentListeners?.();
        unlockScroll();
    });

    $: {
        if (showMenu) {
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
</script>

<div class="relative" bind:this={navRoot}>
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
</div>
