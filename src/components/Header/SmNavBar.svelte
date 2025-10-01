<script>
    import Icon from '@iconify/svelte';
    import { fade } from 'svelte/transition';
    import { CATEGORY_LINKS } from '@/utils/categories';
    import { onDestroy, onMount, tick } from 'svelte';

    const categoriesMenuId = 'mobile-category-menu';
    const categoriesButtonId = 'mobile-category-button';
    const mobileMenuId = 'mobile-navigation-menu';

    const mobileNavLinkClass =
        'appearance-none bg-transparent font-inherit text-[inherit] tracking-[inherit] block w-full pb-1 text-left font-semibold uppercase leading-none tracking-[0.2em] transition-colors duration-200 hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text';

    let showMenu = false;
    let showCategories = false;
    let categoriesButton;
    let categoriesMenu;
    let navRoot;
    let menuButton;

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

    let removeDocumentListeners = null;

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
    });
</script>

<div class="relative" bind:this={navRoot}>
    <button
        bind:this={menuButton}
        type="button"
        on:click={toggleMenu}
        class="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border-ink/80 bg-card-bg text-primary-text transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
        aria-expanded={showMenu}
        aria-controls={mobileMenuId}
        aria-label={showMenu ? 'Close navigation' : 'Open navigation'}
    >
        {#if showMenu}
            <Icon icon="ri:close-line" class="pointer-events-none h-5 w-5" />
        {:else}
            <Icon icon="ri:menu-line" class="pointer-events-none h-5 w-5" />
        {/if}
    </button>
    {#if showMenu}
        <nav
            id={mobileMenuId}
            transition:fade={{ duration: 120 }}
            class="absolute right-0 top-12 z-50 w-56 rounded-lg border border-border-ink/80 bg-card-bg p-4 shadow-sm"
        >
            <ul class="flex flex-col gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-secondary-text">
                <li>
                    <a href="/" on:click={closeMenu} class={mobileNavLinkClass}>
                        Home
                    </a>
                </li>
                <li class="relative">
                    <button
                        id={categoriesButtonId}
                        bind:this={categoriesButton}
                        class={mobileNavLinkClass}
                        type="button"
                        on:click|stopPropagation={toggleCategories}
                        on:keydown={handleCategoriesKeydown}
                        aria-expanded={showCategories}
                        aria-controls={categoriesMenuId}
                    >
                        CATEGORY
                    </button>
                    {#if showCategories}
                        <div
                            bind:this={categoriesMenu}
                            id={categoriesMenuId}
                            class="mt-2 rounded-lg border border-border-ink/80 bg-card-bg py-3 shadow-sm"
                            role="menu"
                            aria-labelledby={categoriesButtonId}
                            tabindex="-1"
                            on:keydown={handleCategoriesKeydown}
                        >
                            <ul class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-text">
                                {#each CATEGORY_LINKS as category}
                                    <li>
                                        <a
                                            href={`/categories/${category.slug}`}
                                            class="block px-4 py-1.5 transition-colors duration-200 hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text"
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
                    <a href="/publishing" on:click={closeMenu} class={mobileNavLinkClass}>
                        Publishing
                    </a>
                </li>
                <li>
                    <a href="/about" on:click={closeMenu} class={mobileNavLinkClass}>
                        About
                    </a>
                </li>
            </ul>
        </nav>
    {/if}
</div>
