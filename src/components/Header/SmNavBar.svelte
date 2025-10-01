<script>
    import Icon from '@iconify/svelte';
    import { fade } from 'svelte/transition';
    import { CATEGORY_LINKS } from '@/utils/categories';
    import { onDestroy, onMount, tick } from 'svelte';

    const categoriesMenuId = 'mobile-category-menu';
    const categoriesButtonId = 'mobile-category-button';

    let showMenu = false;
    let showCategories = false;
    let categoriesButton;
    let categoriesMenu;

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
        showMenu = !showMenu;
        if (!showMenu) {
            closeCategories({ restoreFocus: false });
        }
    };

    const closeMenu = () => {
        showMenu = false;
        closeCategories({ restoreFocus: false });
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
            if (
                showCategories &&
                !categoriesMenu?.contains(event.target) &&
                !categoriesButton?.contains(event.target)
            ) {
                closeCategories();
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
            class="absolute right-0 top-12 z-50 w-56 rounded-lg border border-border-ink/80 bg-card-bg p-4 shadow-sm"
        >
            <ul class="flex flex-col gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-secondary-text">
                <li>
                    <a href="/" on:click={closeMenu} class="block pb-1">
                        Home
                    </a>
                </li>
                <li class="relative">
                    <button
                        id={categoriesButtonId}
                        bind:this={categoriesButton}
                        class="flex w-full items-center justify-between gap-2 pb-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text"
                        type="button"
                        on:click|stopPropagation={toggleCategories}
                        on:keydown={handleCategoriesKeydown}
                        aria-expanded={showCategories}
                        aria-controls={categoriesMenuId}
                    >
                        <span>Categories</span>
                        <svg
                            class={`h-3 w-3 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                            focusable="false"
                            viewBox="0 0 12 8"
                        >
                            <path d="M1.41.58 6 5.17 10.59.58 12 2 6 8 0 2z" fill="currentColor" />
                        </svg>
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
                    <a href="/about" on:click={closeMenu} class="block pb-1">
                        About
                    </a>
                </li>
            </ul>
        </nav>
    {/if}
</div>
