<script lang="ts">
  import Icon from '@iconify/svelte';
  import { portal } from '@/lib/actions/portal';
  import { onDestroy, onMount, tick } from 'svelte';

  type SearchEntry = {
    title: string; description: string; category: string; url: string;
    excerpt: string; pubDate: string; searchField: string;
  };

  let theme: 'light' | 'dark' = 'light';
  let searchOpen = false;
  let searchEntries: SearchEntry[] = [];
  let hasLoadedSearch = false;
  let isLoadingSearch = false;
  let searchError = '';
  let searchQuery = '';

  let searchInput: HTMLInputElement | null = null;
  let searchButton: HTMLButtonElement | null = null;
  let searchDialog: HTMLElement | null = null;
  let searchWrapper: HTMLDivElement | null = null;

  let openedBy: HTMLElement | null = null;
  let shortcutLabel = 'Ctrl K';
  let isMobile = false;
  let removeMediaListener: (() => void) | null = null;

  let previousOverflow = '';
  let scrollLocked = false;

  const canUseDOM = typeof document !== 'undefined';

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

  const setTheme = (value: 'light' | 'dark') => {
    theme = value;
    if (!canUseDOM) return;
    try { window.localStorage.setItem('theme', value); } catch {}
    document.documentElement.setAttribute('data-theme', value);
  };

  const initialiseTheme = () => {
    if (!canUseDOM) return;
    try {
      const stored = window.localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') { setTheme(stored); return; }
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } catch { setTheme('light'); }
  };
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const loadSearchIndex = async () => {
    if (hasLoadedSearch || isLoadingSearch) return;
    isLoadingSearch = true; searchError = '';
    try {
      const response = await fetch('/search.json', { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Unable to fetch search index');
      searchEntries = await response.json();
      hasLoadedSearch = true;
    } catch { searchError = 'Search is unavailable right now. Please try again later.'; }
    finally { isLoadingSearch = false; }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return '';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const cleanSnippet = (s = '') => s.replace(/\s*(?:\.{3}|…)\s*$/,'');

  function squelchNextClick() {
    if (!canUseDOM) return;
    const block = (e: MouseEvent) => {
      e.stopPropagation(); e.preventDefault();
      window.removeEventListener('click', block, true);
    };
    window.addEventListener('click', block, true);
  }

  const openSearch = async () => {
    if (canUseDOM) {
      const active = document.activeElement;
      openedBy = active instanceof HTMLElement ? active : null;
    }
    searchOpen = true;
    await loadSearchIndex();
    await tick();
    setupA11y();
    if (!isMobile) searchInput?.focus();
  };

  const closeSearch = (options: { restoreFocus?: boolean } = { restoreFocus: true }) => {
    if (!searchOpen) return;
    teardownA11y();
    searchOpen = false;
    if (options.restoreFocus !== false && canUseDOM) {
      if (openedBy && document.contains(openedBy)) openedBy.focus();
      else searchButton?.focus();
    }
    openedBy = null;
  };

  const handleGlobalKeydown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && (event.key === 'k' || event.key === 'K')) {
      event.preventDefault(); searchOpen ? closeSearch() : openSearch();
    } else if (event.key === 'Escape' && searchOpen) {
      event.preventDefault(); closeSearch();
    }
  };
  const handleInputKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeSearch(); }
  };

  const handleWrapperPointerDown = (event: PointerEvent) => {
    if (!searchDialog) return;
    const target = event.target as Node | null;
    if (target && searchDialog.contains(target)) return;
    event.preventDefault(); event.stopPropagation();
    squelchNextClick();
    closeSearch({ restoreFocus: false });
  };

  const onOpenSearchEvent = () => { openSearch(); };

  onMount(() => {
    initialiseTheme();
    if (!canUseDOM) return;

    document.addEventListener('keydown', handleGlobalKeydown);

    try { shortcutLabel = navigator.platform?.includes('Mac') ? '⌘ K' : 'Ctrl K'; } catch {}

    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const applyMatch = () => { isMobile = mediaQuery.matches; };
    applyMatch();
    mediaQuery.addEventListener('change', applyMatch);
    removeMediaListener = () => mediaQuery.removeEventListener('change', applyMatch);

    window.addEventListener('open-global-search', onOpenSearchEvent as EventListener);
  });

  onDestroy(() => {
    if (canUseDOM) document.removeEventListener('keydown', handleGlobalKeydown);
    teardownA11y(); unlockScroll();
    removeMediaListener?.(); removeMediaListener = null;
    if (typeof window !== 'undefined') window.removeEventListener('open-global-search', onOpenSearchEvent as EventListener);
  });

  $: { if (canUseDOM) (searchOpen ? lockScroll() : unlockScroll()); }

  $: trimmedQuery = searchQuery.trim().toLowerCase();
  $: filteredResults = hasLoadedSearch
    ? (trimmedQuery ? searchEntries.filter((entry) => entry.searchField.includes(trimmedQuery)) : searchEntries.slice(0, 12))
    : [];
  $: mobileVisible = filteredResults.slice(0, 3);
  $: desktopVisible = filteredResults.slice(0, 6);

  const focusableSelector =
    'a[href],area[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  const getFocusableElements = () => {
    if (!searchDialog) return [] as HTMLElement[];
    return Array.from(searchDialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
      (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
    );
  };

  type InertHTMLElement = HTMLElement & { inert: boolean };

  const setBodyInert = (isInert: boolean) => {
    if (!canUseDOM) return;
    Array.from(document.body.children).forEach((child) => {
      if (searchWrapper && (child === searchWrapper || child.contains(searchWrapper))) return;
      const el = child as InertHTMLElement;
      el.inert = isInert;
      if (isInert) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  };

  let trapListener: ((event: KeyboardEvent) => void) | null = null;
  const setupA11y = () => {
    if (!searchDialog) return;
    teardownA11y();
    trapListener = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusables = getFocusableElements(); if (!focusables.length) return;
      const first = focusables[0]; const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (active === first || !searchDialog.contains(active)) { event.preventDefault(); last.focus(); }
      } else if (active === last || !searchDialog.contains(active)) { event.preventDefault(); first.focus(); }
    };
    searchDialog.addEventListener('keydown', trapListener);
    setBodyInert(true);
  };
  const teardownA11y = () => {
    if (trapListener && searchDialog) searchDialog.removeEventListener('keydown', trapListener);
    trapListener = null; setBodyInert(false);
  };
</script>

<div class="flex items-center gap-2">
  <!-- 🔎 escondido no mobile; visível no desktop -->
  <button
    bind:this={searchButton}
    type="button"
    on:click={() => (searchOpen ? closeSearch() : openSearch())}
    class="hidden md:flex h-10 w-10 items-center justify-center rounded bg-transparent text-secondary-text hover:text-primary-text ui-transition ui-focus"
    aria-label={searchOpen ? 'Close search' : 'Open search'}
    aria-expanded={searchOpen}
    aria-haspopup="dialog"
  >
    <Icon icon="ri:search-line" class="h-6 w-6" />
  </button>

  <!-- 🌙 toggle com hit-target grande no mobile -->
  <button
    type="button"
    on:click={toggleTheme}
    class="flex h-11 w-11 md:h-10 md:w-10 items-center justify-center rounded bg-transparent text-secondary-text hover:text-primary-text ui-transition ui-focus"
    aria-pressed={theme === 'dark' ? 'true' : 'false'}
    aria-label={`Ativar modo ${theme === 'light' ? 'escuro' : 'claro'}`}
  >
    {#if theme === 'light'} <Icon icon="solar:sun-2-bold" class="h-6 w-6 md:h-6 md:w-6" />
    {:else}                <Icon icon="solar:moon-bold"  class="h-6 w-6 md:h-6 md:w-6" /> {/if}
  </button>
</div>

{#if searchOpen}
  <div
    bind:this={searchWrapper}
    use:portal
    class="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 md:pt-24 pb-6"
    on:pointerdown={handleWrapperPointerDown}
  >
    <div
      class="absolute inset-0 bg-primary-bg/70 backdrop-blur-sm"
      on:pointerdown|preventDefault|stopPropagation={() => { closeSearch({ restoreFocus: false }); }}
      on:click|preventDefault|stopPropagation
    />
    <section
      bind:this={searchDialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-search-title"
      class="relative z-10 w-full max-w-xl lg:max-w-[40rem] overflow-hidden rounded border border-border-ink/80 bg-card-bg shadow-xl"
      on:keydown={handleInputKeydown}
      on:click|stopPropagation
    >
      <h2 id="global-search-title" class="sr-only">Busca global</h2>

      <div class="flex flex-col gap-4 p-4">
        <div class="flex items-center gap-3 rounded border border-border-ink/70 bg-card-bg px-3 py-2.5 shadow-sm">
          <Icon icon="ri:search-line" class="h-5 w-5 text-secondary-text" />
          <label class="sr-only" for="global-search-input">Buscar posts</label>
          <input id="global-search-input" bind:this={searchInput} bind:value={searchQuery} type="search" inputmode="search"
            placeholder="Pesquise por tópicos, palavras ou postagens"
            class="flex-1 bg-transparent text-base text-primary-text placeholder:text-muted-text focus:outline-none"
            autocomplete="off" spellcheck="false" {...(isMobile ? { readonly: true } : {})}
            on:pointerdown={() => {
              if (isMobile && searchInput?.hasAttribute('readonly')) {
                searchInput.removeAttribute('readonly');
                requestAnimationFrame(() => searchInput?.focus());
              }
            }}
          />
        </div>

        {#if searchError}
          <p class="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{searchError}</p>
        {:else if isLoadingSearch}
          <p class="px-1 text-sm text-secondary-text">Carregando índice…</p>
        {:else if (isMobile ? mobileVisible.length : desktopVisible.length)}
          <div class={isMobile ? 'max-h-[60vh] overflow-y-auto' : ''}>
            <ul class="flex flex-col gap-3 pr-1">
              {#each (isMobile ? mobileVisible : desktopVisible) as result}
                <li>
                  <a href={result.url} class="block rounded border border-transparent px-3 py-2.5 ui-transition hover:border-border-ink/70 hover:bg-surface-bg ui-focus" on:click={() => closeSearch({ restoreFocus: false })}>
                    <div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-text">
                      <span>{result.category}</span>
                      {#if result.pubDate}<span aria-hidden="true">/</span><span>{formatDate(result.pubDate)}</span>{/if}
                    </div>
                    <p class="mt-1 text-base font-semibold text-primary-text">{result.title}</p>
                    <p class="mt-0.5 text-sm text-secondary-text">{cleanSnippet(result.description || result.excerpt)}</p>
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {:else}
          <p class="px-1 text-sm text-secondary-text">
            {trimmedQuery ? 'Nenhum post encontrado.' : 'Comece a digitar para buscar.'}
          </p>
        {/if}
      </div>
    </section>
  </div>
{/if}
