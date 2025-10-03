<script>
    import Icon from '@iconify/svelte';
    import { fade } from 'svelte/transition';
    import { CATEGORY_LINKS } from '@/utils/categories';
    import { onDestroy, onMount, tick } from 'svelte';

    const DEFAULT_NAV_SPEED = 300;
    const LINEAR_EASING = (t) => t;

    const cubicBezier = (mX1, mY1, mX2, mY2) => {
        const NEWTON_ITERATIONS = 4;
        const NEWTON_MIN_SLOPE = 0.001;
        const SUBDIVISION_PRECISION = 0.0000001;
        const SUBDIVISION_MAX_ITERATIONS = 10;
        const kSplineTableSize = 11;
        const kSampleStepSize = 1 / (kSplineTableSize - 1);

        const sampleValues = new Float32Array(kSplineTableSize);

        const calcBezier = (t, a1, a2) => ((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t * t + 3 * a1 * t;
        const getSlope = (t, a1, a2) => 3 * (1 - 3 * a2 + 3 * a1) * t * t + 2 * (3 * a2 - 6 * a1) * t + 3 * a1;

        for (let i = 0; i < kSplineTableSize; ++i) {
            sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        }

        const getTForX = (x) => {
            let intervalStart = 0;
            let currentSample = 1;
            const lastSample = kSplineTableSize - 1;

            for (; currentSample !== lastSample && sampleValues[currentSample] <= x; ++currentSample) {
                intervalStart += kSampleStepSize;
            }

            --currentSample;

            const dist = (x - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
            let guessForT = intervalStart + dist * kSampleStepSize;

            const initialSlope = getSlope(guessForT, mX1, mX2);
            if (initialSlope >= NEWTON_MIN_SLOPE) {
                for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
                    const currentSlope = getSlope(guessForT, mX1, mX2);
                    if (currentSlope === 0) {
                        return guessForT;
                    }
                    const currentX = calcBezier(guessForT, mX1, mX2) - x;
                    guessForT -= currentX / currentSlope;
                }
                return guessForT;
            }

            if (initialSlope === 0) {
                return guessForT;
            }

            let a = intervalStart;
            let b = intervalStart + kSampleStepSize;
            let currentT = guessForT;

            for (let i = 0; i < SUBDIVISION_MAX_ITERATIONS && b - a > SUBDIVISION_PRECISION; ++i) {
                const currentX = calcBezier(currentT, mX1, mX2) - x;
                if (currentX > 0) {
                    b = currentT;
                } else {
                    a = currentT;
                }
                currentT = (a + b) / 2;
            }

            return currentT;
        };

        return (x) => {
            if (mX1 === mY1 && mX2 === mY2) {
                return x;
            }
            return calcBezier(getTForX(x), mY1, mY2);
        };
    };

    const easingMap = new Map([
        ['linear', LINEAR_EASING],
        ['ease', cubicBezier(0.25, 0.1, 0.25, 1)],
        ['ease-in', cubicBezier(0.42, 0, 1, 1)],
        ['ease-out', cubicBezier(0, 0, 0.58, 1)],
        ['ease-in-out', cubicBezier(0.42, 0, 0.58, 1)]
    ]);

    const parseDuration = (value) => {
        if (typeof value !== 'string') {
            return DEFAULT_NAV_SPEED;
        }

        const trimmed = value.trim();

        if (!trimmed) {
            return DEFAULT_NAV_SPEED;
        }

        if (trimmed.endsWith('ms')) {
            const numeric = Number.parseFloat(trimmed);
            return Number.isNaN(numeric) ? DEFAULT_NAV_SPEED : numeric;
        }

        if (trimmed.endsWith('s')) {
            const numeric = Number.parseFloat(trimmed);
            return Number.isNaN(numeric) ? DEFAULT_NAV_SPEED : numeric * 1000;
        }

        const fallback = Number.parseFloat(trimmed);
        return Number.isNaN(fallback) ? DEFAULT_NAV_SPEED : fallback;
    };

    const parseEasing = (value) => {
        if (typeof value !== 'string') {
            return LINEAR_EASING;
        }

        const trimmed = value.trim();

        if (!trimmed) {
            return LINEAR_EASING;
        }

        if (easingMap.has(trimmed)) {
            return easingMap.get(trimmed);
        }

        const cubicMatch = trimmed.match(/cubic-bezier\(([^)]+)\)/i);
        if (cubicMatch) {
            const points = cubicMatch[1]
                .split(',')
                .map((part) => Number.parseFloat(part.trim()))
                .filter((point) => Number.isFinite(point));

            if (points.length === 4) {
                return cubicBezier(points[0], points[1], points[2], points[3]);
            }
        }

        return LINEAR_EASING;
    };

    let navFadeOptions = {
        duration: DEFAULT_NAV_SPEED,
        easing: LINEAR_EASING
    };

    const categoriesMenuId = 'mobile-category-menu';
    const categoriesButtonId = 'mobile-category-button';
    const mobileMenuId = 'mobile-navigation-menu';

    const mobileNavLinkClass =
        'group flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.28em] leading-none text-secondary-text transition-colors nav-transition hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text';
    const mobileCategoryLinkClass =
        'block rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-text transition-colors nav-transition hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text';

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

    const updateNavFadeOptions = () => {
        if (typeof document === 'undefined') {
            return;
        }

        const rootStyle = getComputedStyle(document.documentElement);
        const duration = parseDuration(rootStyle.getPropertyValue('--nav-speed'));
        const easing = parseEasing(rootStyle.getPropertyValue('--nav-ease'));

        navFadeOptions = {
            duration,
            easing
        };
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

        updateNavFadeOptions();

        const observer = new MutationObserver(updateNavFadeOptions);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style', 'class', 'data-theme']
        });

        return () => {
            observer.disconnect();
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
          class="relative z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border-ink/80 bg-card-bg
         text-secondary-text hover:text-primary-text ui-transition ui-focus"
        aria-expanded={showMenu}
        aria-controls={mobileMenuId}
        aria-haspopup="true"
        aria-label={showMenu ? 'Close navigation' : 'Open navigation'}
    >
        <Icon icon={showMenu ? 'ri:close-line' : 'ri:menu-line'} class="pointer-events-none h-5 w-5" />
    </button>

    {#if showMenu}
        <div
            class="fixed inset-0 z-40 bg-primary-bg/70 backdrop-blur-sm"
            transition:fade={navFadeOptions}
            aria-hidden="true"
            on:click={handleOverlayClick}
        ></div>
        <nav
            id={mobileMenuId}
            aria-label="Mobile navigation"
            transition:fade={navFadeOptions}
            class="absolute right-0 top-12 z-50 w-64 max-w-[85vw] rounded-2xl border border-border-ink/80 bg-card-bg p-4 shadow-xl"
        >
            <ul class="flex flex-col gap-2 text-secondary-text">
                <li>
                    <a href="/" on:click={closeMenu} class={mobileNavLinkClass}>
                        <span>Home</span>
                        <Icon icon="ri:arrow-right-up-line" class="h-4 w-4 opacity-0 transition-opacity nav-transition group-hover:opacity-100" />
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
                        <Icon icon="ri:arrow-right-up-line" class="h-4 w-4 opacity-0 transition-opacity nav-transition group-hover:opacity-100" />
                    </a>
                </li>
            </ul>
        </nav>
    {/if}
</div>
