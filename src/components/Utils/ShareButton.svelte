<script lang="ts">
    import Icon from '@iconify/svelte';
    import { onDestroy, onMount } from 'svelte';

    export let url = '';
    export let title = '';

    let shareSupported = false;
    let copied = false;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    const getShareUrl = () => {
        if (url) {
            return url;
        }

        if (typeof window !== 'undefined') {
            return window.location.href;
        }

        return '';
    };

    const clearTimer = () => {
        if (resetTimer) {
            clearTimeout(resetTimer);
            resetTimer = null;
        }
    };

    const handleCopy = async (shareUrl: string) => {
        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl);
                copied = true;
                clearTimer();
                resetTimer = setTimeout(() => {
                    copied = false;
                }, 2000);
            }
        } catch (error) {
            copied = false;
        }
    };

    const handleShare = async () => {
        const shareUrl = getShareUrl();
        const shareTitle = title || 'Read this post on Lefthand Journal';

        if (!shareUrl) {
            return;
        }

        try {
            if (shareSupported && typeof navigator !== 'undefined') {
                await navigator.share({ url: shareUrl, title: shareTitle });
                return;
            }
        } catch (error) {
            // fall back to copying when native share fails
        }

        await handleCopy(shareUrl);
    };

    onMount(() => {
        shareSupported = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    });

    onDestroy(() => {
        clearTimer();
    });
</script>

<div class="relative inline-flex items-center" data-share-button>
    <button
        type="button"
        on:click={handleShare}
        class="inline-flex items-center gap-2 rounded-full border border-border-ink/70 bg-card-bg px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-text transition-colors duration-200 hover:text-primary-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
    >
        <Icon icon={shareSupported ? 'ri:share-forward-line' : 'ri:file-copy-line'} class="h-4 w-4" />
        <span>Share</span>
    </button>
    <span class="sr-only" aria-live="polite">{copied ? 'Link copied to clipboard' : ''}</span>
    {#if copied}
        <span class="absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-lg border border-border-ink/70 bg-card-bg px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary-text shadow-sm">
            Copied
        </span>
    {/if}
</div>
