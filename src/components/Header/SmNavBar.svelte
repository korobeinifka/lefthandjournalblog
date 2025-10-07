<script lang="ts">
  import Icon from '@iconify/svelte';
  import { onDestroy, onMount, tick } from 'svelte';
  import { CATEGORY_LINKS } from '@/utils/categories';
  import { portal } from '@/lib/actions/portal';

  const canUseDOM = typeof document !== 'undefined';

  let open = false;
  let showCats = false;
  let menuButton: HTMLButtonElement | null = null;
  let panel: HTMLElement | null = null;

  // Scroll lock
  let prevOverflow = '';
  let locked = false;
  function lockScroll() {
    if (!canUseDOM || locked) return;
    prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    locked = true;
  }
  function unlockScroll() {
    if (!canUseDOM || !locked) return;
    document.documentElement.style.overflow = prevOverflow;
    locked = false;
  }

  function squelchNextClick() {
    if (!canUseDOM) return;
    const block = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      window.removeEventListener('click', block, true);
    };
    // Captura global: engole o próximo click que o navegador emitiria
    window.addEventListener('click', block, true);
  }

  async function openMenu() {
    open = true;
    lockScroll();
    await tick();
    if (!panel) return;
    const firstFocusable = panel.querySelector<HTMLElement>(
      'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
    );
    (firstFocusable ?? panel).focus();
  }
  function closeMenu(opts: { restoreFocus?: boolean } = {}) {
    open = false;
    showCats = false;
    unlockScroll();
    if (opts.restoreFocus !== false) menuButton?.focus();
  }
  function toggleMenu() {
    open ? closeMenu() : openMenu();
  }

  function onKey(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
    }
  }

  let boundKey: ((e: KeyboardEvent) => void) | null = null;
  onMount(() => {
    if (!canUseDOM) return;
    boundKey = (e) => onKey(e);
    document.addEventListener('keydown', boundKey);
  });
  onDestroy(() => {
    if (boundKey) document.removeEventListener('keydown', boundKey);
    unlockScroll();
  });
</script>

<div class="relative [--sm-menu-zoom:0.9]">
  <button
    bind:this={menuButton}
    type="button"
    aria-expanded={open}
    aria-haspopup="true"
    aria-controls="mobile-nav"
    on:click={toggleMenu}
    class="relative z-50 flex h-10 w-10 items-center justify-center rounded bg-transparent text-secondary-text hover:text-primary-text ui-transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text"
    aria-label={open ? 'Close navigation' : 'Open navigation'}
  >
    <Icon icon={open ? 'ri:close-line' : 'ri:menu-line'} class="pointer-events-none h-5 w-5" />
  </button>

  {#if open}
    <!-- Portal para garantir que o backdrop cobre TUDO (igual ao search) -->
    <div use:portal class="fixed inset-0 z-[70] md:hidden">
      <!-- BACKDROP: bloqueia pointer e fecha -->
      <div
        class="absolute inset-0 bg-primary-bg/70 backdrop-blur-sm"
        on:pointerdown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          squelchNextClick();
          closeMenu({ restoreFocus: false });
        }}
        on:click={(e) => {
          // Por segurança, se o navegador ainda emitir click, engolimos também
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      <!-- PAINEL -->
      <nav
        bind:this={panel}
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        class="fixed right-3 top-14 z-[75] w-72 max-w-[85vw] rounded border border-border-ink/80 bg-card-bg shadow-xl transition-transform duration-200 md:hidden"
        style="transform: scale(var(--sm-menu-zoom, 0.9)); transform-origin: top right;"
        on:click|stopPropagation
      >
        <ul class="p-3 text-secondary-text">
          <li>
            <a
              href="/"
              class="block rounded px-4 py-3 text-sm font-semibold uppercase tracking-[0.28em] hover:text-primary-text ui-transition"
              on:click={() => closeMenu({ restoreFocus: false })}
            >INÍCIO</a>
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
                    <a
                      href={`/categories/${item.slug}`}
                      class="block rounded px-4 py-2 text-xs uppercase tracking-[0.24em] hover:text-primary-text ui-transition"
                      on:click={() => closeMenu({ restoreFocus: false })}
                    >{item.label.toUpperCase()}</a>
                  </li>
                {/each}
                <li><div class="mx-4 my-1 h-px bg-border-ink/60"></div></li>
                <li>
                  <a
                    href="/categories"
                    class="block rounded-[6px] px-4 py-2 text-xs uppercase tracking-[0.24em] hover:text-primary-text ui-transition"
                    on:click={() => closeMenu({ restoreFocus: false })}
                  >OUTRAS</a>
                </li>
              </ul>
            {/if}
          </li>

          <li class="mt-1">
            <a
              href="/about"
              class="block rounded px-4 py-3 text-sm font-semibold uppercase tracking-[0.28em] hover:text-primary-text ui-transition"
              on:click={() => closeMenu({ restoreFocus: false })}
            >SOBRE</a>
          </li>
        </ul>
      </nav>
    </div>
  {/if}
</div>
