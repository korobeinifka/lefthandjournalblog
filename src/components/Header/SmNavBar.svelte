<script>
    import Icon from '@iconify/svelte';
    import { fade } from 'svelte/transition';
    import { CATEGORY_LINKS } from '@/utils/categories';
    import { onDestroy, onMount, tick } from 'svelte';

    const categoriesMenuId = 'mobile-category-menu';
    const categoriesButtonId = 'mobile-category-button';
    const mobileMenuId = 'mobile-navigation-menu';

    const mobileNavLinkClass =
        'group flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.28em] leading-none text-secondary-text transition-colors duration-200 hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text';
    const mobileCategoryLinkClass =
        'block rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-text transition-colors duration-200 hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text';

    let showMenu = false;
    let showCategories = false;
    let categoriesButton;
    let categoriesMenu;
    let navRoot;
    let menuButton;
    let removeDocumentListeners = null;
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
        const firstLink = categoriesMenu?.querySelector('a');
        firstLink?.focus();
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

        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('keydown', handleDocumentKeydown);

        removeDocumentListeners = () => {
            document.removeEventListener('click', handleDocumentClick);
            document.removeEventListener('keydown', handleDocumentKeydown);
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
</div>
