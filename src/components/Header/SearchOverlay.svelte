<script lang="ts">
    import Icon from '@iconify/svelte';
    import { createEventDispatcher, onDestroy, onMount, afterUpdate, tick } from 'svelte';
    import { fade, scale } from 'svelte/transition';
    
    type SearchResult = {
        title: string;
        excerpt: string;
        url: string;
        slug: string;
        pubDate?: string;
        category?: string | null;
    };

    const dispatcher = createEventDispatcher();

    let query = '';
    let results: SearchResult[] = [];
    let loading = false;
    let error = '';
    let inputRef: HTMLInputElement | null = null;
    let panelRef: HTMLElement | null = null;
    let abortController: AbortController | null = null;
    let focusableElements: HTMLElement[] = [];
    let debounceId: ReturnType<typeof setTimeout> | null = null;
    let previousOverflow: string | null = null;

    const close = () => {
        dispatcher('close');
    };

    const updateFocusableElements = () => {
        if (!panelRef) {
            focusableElements = [];
            return;
        }

        const selectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'textarea:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];

        focusableElements = Array.from(
            panelRef.querySelectorAll<HTMLElement>(selectors.join(','))
        ).filter((element) => !element.hasAttribute('aria-hidden'));
    };

    const handleKeydown = (event: KeyboardEvent) => {
        if (!panelRef) {
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            close();
            return;
        }

        if (event.key === 'Tab') {
            updateFocusableElements();

            if (focusableElements.length === 0) {
                event.preventDefault();
                return;
            }

            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];
            const active = document.activeElement as HTMLElement | null;

            if (event.shiftKey) {
                if (!active || active === first) {
                    event.preventDefault();
                    last.focus();
                }
            } else if (active === last) {
                event.preventDefault();
                first.focus();
            }
        }
    };

    const performSearch = async (value: string) => {
        if (abortController) {
            abortController.abort();
        }

        if (!value) {
            results = [];
            loading = false;
            error = '';
            return;
        }

        abortController = new AbortController();
        loading = true;
        error = '';

        try {
            const response = await fetch(`/api/posts.json?q=${encodeURIComponent(value)}`, {
                signal: abortController.signal,
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Request failed');
            }

            const payload = await response.json();
            results = Array.isArray(payload?.results) ? payload.results : [];
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                return;
            }

            error = 'Unable to fetch search results right now. Please try again soon.';
        } finally {
            if (!abortController?.signal.aborted) {
                loading = false;
            }
            abortController = null;
        }
    };

    const scheduleSearch = (value: string) => {
        if (debounceId) {
            clearTimeout(debounceId);
        }

        if (!value.trim()) {
            if (abortController) {
                abortController.abort();
                abortController = null;
            }
            query = value;
            results = [];
            error = '';
            loading = false;
            return;
        }

        debounceId = setTimeout(() => {
            performSearch(value.trim());
        }, 250);
    };

    const handleInput = (event: Event) => {
        const target = event.target as HTMLInputElement;
        query = target.value;
        scheduleSearch(query);
    };

    const handlePointerDown = (event: MouseEvent) => {
        if (panelRef && !panelRef.contains(event.target as Node)) {
            close();
        }
    };

    onMount(async () => {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeydown);
        await tick();
        updateFocusableElements();
        inputRef?.focus();
    });

    afterUpdate(() => {
        updateFocusableElements();
    });

    onDestroy(() => {
        window.removeEventListener('keydown', handleKeydown);
        if (abortController) {
            abortController.abort();
        }
        if (debounceId) {
            clearTimeout(debounceId);
        }
        if (previousOverflow !== null) {
            document.body.style.overflow = previousOverflow;
        } else {
            document.body.style.removeProperty('overflow');
        }
    });
</script>

<svelte:window on:focusin={updateFocusableElements} on:pointerdown={handlePointerDown} />

<div
    class="fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 backdrop-blur"
    transition:fade={{ duration: 150 }}
>
    <div
        bind:this={panelRef}
        class="relative mx-4 w-full max-w-2xl overflow-hidden rounded-3xl border border-border-ink/80 bg-page-bg text-primary-text shadow-xl"
        on:click|stopPropagation
        transition:scale={{ start: 0.95, duration: 150 }}
        role="dialog"
        aria-modal="true"
        aria-label="Search posts"
    >
        <button
            class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-border-ink/80 bg-card-bg text-primary-text transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
            type="button"
            on:click={close}
            aria-label="Close search"
        >
            <Icon icon="tabler:x" class="h-5 w-5" />
        </button>

        <form class="border-b border-border-ink/70 bg-card-bg/40 px-6 py-5" on:submit|preventDefault>
            <label class="flex items-center gap-3">
                <Icon icon="tabler:search" class="h-5 w-5 text-secondary-text" />
                <input
                    bind:this={inputRef}
                    class="w-full border-0 bg-transparent text-base text-primary-text placeholder:text-secondary-text focus:outline-none"
                    type="search"
                    placeholder="Search posts"
                    value={query}
                    on:input={handleInput}
                    autocomplete="off"
                />
            </label>
        </form>

        <div class="max-h-[60vh] overflow-y-auto px-6 py-6">
            {#if !query.trim()}
                <p class="text-sm leading-6 text-secondary-text">
                    Start typing to find posts by title, summary, or body content.
                </p>
            {:else if (loading)}
                <p class="text-sm leading-6 text-secondary-text">Searching…</p>
            {:else if (error)}
                <p class="text-sm leading-6 text-secondary-text">{error}</p>
            {:else if (results.length === 0)}
                <p class="text-sm leading-6 text-secondary-text">No posts matched your search.</p>
            {:else}
                <ul class="space-y-5">
                    {#each results as result}
                        <li>
                            <a
                                href={result.url}
                                class="block rounded-2xl border border-transparent bg-transparent p-5 transition-colors duration-150 hover:border-border-ink/60 hover:bg-card-bg/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text"
                            >
                                <h3 class="text-lg font-semibold text-primary-text">{result.title}</h3>
                                {#if result.excerpt}
                                    <p class="mt-2 text-sm leading-6 text-secondary-text">{result.excerpt}</p>
                                {/if}
                            </a>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>
</div>

<style>
    .bg-overlay\/60 {
        background-color: rgba(15, 23, 42, 0.6);
    }

    [data-theme='light'] .bg-overlay\/60 {
        background-color: rgba(15, 23, 42, 0.45);
    }
</style>
