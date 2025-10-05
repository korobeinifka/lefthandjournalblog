<script lang="ts">
  import Icon from '@iconify/svelte';
  import { onDestroy, onMount } from 'svelte';
  import { CATEGORY_LINKS } from '@/utils/categories';

  const canUseDOM = typeof document !== 'undefined';

  let showMenu = false;
  let showCats = false;
  let menuButton: HTMLButtonElement | null = null;
  let navPanel: HTMLElement | null = null;

  let previousOverflow = '';
  let scrollLocked = false;
  let removeOutside: (() => void) | null = null;

  const lockScroll = () => {
    if (!canUseDOM || scrollLocked) return;
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    scrollLocked = true;
  };
  const unlockScroll = () => {
    if (!canUseDOM || !scrollLocked) return;
    document.documentElement.style.overflow = previousOverflow;
    scrollLocked = false;
  };

  const toggleMenu = () => { showMenu = !showMenu; if (!showMenu) showCats = false; };
  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (!showMenu) return;
    showMenu = false; showCats = false;
    if (restoreFocus) menuButton?.focus();
  };

  $: { if (canUseDOM) (showMenu ? lockScroll() : unlockScroll()); }

  onMount(() => {
    if (!canUseDOM) return;
    const handlePointerUp = (event: PointerEvent) => {
      if (!showMenu) return;
      const target = event.target as Node | null;
      if (navPanel?.contains(target) || menuButton?.contains(target)) return;
      event.preventDefault();
      event.stopPropagation();
      closeMenu({ restoreFocus: false });
    };
    document.addEventListener('pointerup', handlePointerUp, { capture: true });
    removeOutside = () => document.removeEventListener('pointerup', handlePointerUp, { capture: true } as any);
  });

  onDestroy(() => { removeOutside?.(); removeOutside = null; });
</script>

<!-- Define var com fallback; pode sobrescrever via CSS/parent se quiser -->
<div class="relative [--sm-menu-zoom:0.9]">
  <button
    bind:this={menuButton}
    type="button"
    on:click={toggleMenu}
    class="relative z-50 flex h-10 w-10 items-center justify-center rounded bg-transparent text-secondary-text hover:text-primary-text ui-transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text"
    aria-expanded={showMenu}
    aria-haspopup="true"
    aria-label={showMenu ? 'Close navigation' : 'Open navigation'}
  >
    <Icon icon={showMenu ? 'ri:close-line' : 'ri:menu-line'} class="pointer-events-none h-5 w-5" />
  </button>

  {#if showMenu}
    <div
      class="fixed inset-0 z-40 bg-primary-bg/70 backdrop-blur-sm transition-opacity duration-300 ease-[var(--nav-ease)]"
      on:click={() => closeMenu()}
    />

    <!-- PAINEL com escala 0.9 -->
    <nav
      bind:this={navPanel}
      role="dialog"
      aria-modal="true"
      data-sm-menu
      class="fixed right-3 top-14 z-50 w-72 max-w-[85vw] rounded border border-border-ink/80 bg-card-bg shadow-xl transition-transform duration-300 ease-[var(--nav-ease)] md:hidden"
      style="transform: scale(var(--sm-menu-zoom, 0.9)); transform-origin: top right; will-change: transform;"
    >
      <ul class="p-3 text-secondary-text">
        <li>
          <a href="/" class="block rounded px-4 py-3 text-sm font-semibold uppercase tracking-[0.28em] hover:text-primary-text ui-transition" on:click={() => closeMenu({ restoreFocus: false })}>HOME</a>
        </li>

        <li class="mt-1">
          <button
            type="button"
            class="flex w-full items-center justify-between rounded px-4 py-3 text-sm font-semibold uppercase tracking-[0.28em] hover:text-primary-text ui-transition"
            on:click={() => (showCats = !showCats)}
            aria-expanded={showCats}
          >
            <span>CATEGORY</span>
            <Icon icon={showCats ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'} class="h-4 w-4" />
          </button>

          {#if showCats}
            <ul class="mt-1 space-y-1">
              {#each CATEGORY_LINKS as item}
                <li>
                  <a href={`/categories/${item.slug}`} class="block rounded px-4 py-2 text-xs uppercase tracking-[0.24em] hover:text-primary-text ui-transition" on:click={() => closeMenu({ restoreFocus: false })}>
                    {item.label.toUpperCase()}
                  </a>
                </li>
              {/each}
              <li><div class="mx-4 my-1 h-px bg-border-ink/60"></div></li>
              <li>
                <a
                  href="/categories"
                  class="block rounded-[6px] px-4 py-2 text-xs uppercase tracking-[0.24em] hover:text-primary-text ui-transition"
                  on:click={() => closeMenu({ restoreFocus: false })}
                >
                  OUTRAS
                </a>
              </li>
            </ul>
          {/if}
        </li>

        <li class="mt-1">
          <a href="/about" class="block rounded px-4 py-3 text-sm font-semibold uppercase tracking-[0.28em] hover:text-primary-text ui-transition" on:click={() => closeMenu({ restoreFocus: false })}>ABOUT</a>
        </li>
      </ul>
    </nav>
  {/if}
</div>
