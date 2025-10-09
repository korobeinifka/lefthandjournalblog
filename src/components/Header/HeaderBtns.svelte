<script lang="ts">
  import Icon from '@iconify/svelte';
  import { portal } from '@/lib/actions/portal';
  import { onDestroy, onMount, tick } from 'svelte';

  // THEME
  let theme: 'light' | 'dark' = 'dark';
  const canUseDOM = typeof document !== 'undefined';

  const setTheme = (value: 'light' | 'dark') => {
    theme = value;
    if (!canUseDOM) return;
    try { localStorage.setItem('theme', value); } catch {}
    document.documentElement.setAttribute('data-theme', value);
  };
  const initTheme = () => {
    if (!canUseDOM) return;
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return setTheme(stored);
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'light' || attr === 'dark') return setTheme(attr);
      const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } catch { setTheme('dark'); }
  };
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // SEARCH (como estava)
  type SearchEntry = {
    title: string; description: string; category: string; url: string;
    excerpt: string; pubDate: string; searchField: string;
  };

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
  let isMobile = false;
  let removeMediaListener: (() => void) | null = null;

  const loadSearchIndex = async () => {
    if (hasLoadedSearch || isLoadingSearch) return;
    isLoadingSearch = true; searchError = '';
    try {
      const res = await fetch('/search.json', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Indisponível no momento.');
      searchEntries = await res.json(); hasLoadedSearch = true;
    } catch { searchError = 'Pesquisa indisponível no momento. Tente novamente.'; }
    finally { isLoadingSearch = false; }
  };

  const formatDate = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.valueOf())) return '';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const cleanSnippet = (s = '') => s.replace(/\s*(?:\.{3}|…)\s*$/,'');

  function squelchNextClick() {
    if (!canUseDOM) return;
    const block = (e: MouseEvent) => { e.stopPropagation(); e.preventDefault(); window.removeEventListener('click', block, true); };
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

  const closeSearch = (opts: { restoreFocus?: boolean } = { restoreFocus: true }) => {
    if (!searchOpen) return;
    teardownA11y();
    searchOpen = false;
    if (opts.restoreFocus !== false && canUseDOM) {
      if (openedBy && document.contains(openedBy)) openedBy.focus();
      else searchButton?.focus();
    }
    openedBy = null;
  };

  const handleGlobalKeydown = (ev: KeyboardEvent) => {
    if ((ev.metaKey || ev.ctrlKey) && (ev.key === 'k' || ev.key === 'K')) {
      ev.preventDefault(); searchOpen ? closeSearch() : openSearch();
    } else if (ev.key === 'Escape' && searchOpen) {
      ev.preventDefault(); closeSearch();
    }
  };

  const handleInputKeydown = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); closeSearch(); }
  };

  const handleWrapperPointerDown = (ev: PointerEvent) => {
    if (!searchDialog) return;
    const target = ev.target as Node | null;
    if (target && searchDialog.contains(target)) return;
    ev.preventDefault(); ev.stopPropagation(); squelchNextClick(); closeSearch({ restoreFocus: false });
  };

  const onOpenSearchEvent = () => { openSearch(); };

  onMount(() => {
    initTheme();
    if (!canUseDOM) return;

    document.addEventListener('keydown', handleGlobalKeydown);

    const mq = window.matchMedia('(max-width: 640px)');
    const apply = () => { isMobile = mq.matches; };
    apply(); mq.addEventListener('change', apply);
    removeMediaListener = () => mq.removeEventListener('change', apply);

    window.addEventListener('open-global-search', onOpenSearchEvent as EventListener);
  });

  onDestroy(() => {
    if (canUseDOM) document.removeEventListener('keydown', handleGlobalKeydown);
    removeMediaListener?.(); removeMediaListener = null;
    if (typeof window !== 'undefined') window.removeEventListener('open-global-search', onOpenSearchEvent as EventListener);
  });

  $: trimmedQuery = searchQuery.trim().toLowerCase();
  $: filteredResults = hasLoadedSearch
    ? (trimmedQuery ? searchEntries.filter((e) => e.searchField.includes(trimmedQuery)) : searchEntries.slice(0, 12))
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

  let trapListener: ((event: KeyboardEvent) => void) | null = null;
  const setupA11y = () => {
    if (!searchDialog) return;
    teardownA11y();
    trapListener = (ev: KeyboardEvent) => {
      if (ev.key !== 'Tab') return;
      const focusables = getFocusableElements(); if (!focusables.length) return;
      const first = focusables[0]; const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (ev.shiftKey) {
        if (active === first || !searchDialog.contains(active)) { ev.preventDefault(); last.focus(); }
      } else if (active === last || !searchDialog.contains(active)) { ev.preventDefault(); first.focus(); }
    };
    searchDialog.addEventListener('keydown', trapListener);
  };
  const teardownA11y = () => {
    if (trapListener && searchDialog) searchDialog.removeEventListener('keydown', trapListener);
    trapListener = null;
  };
</script>

<div class="flex items-center gap-2">
  <!-- 🔎 Busca — desktop apenas -->
  <button
    bind:this={searchButton}
    type="button"
    on:click={() => (searchOpen ? closeSearch() : openSearch())}
    class="hidden md:flex h-10 w-10 items-center justify-center rounded bg-transparent text-secondary-text hover:text-primary-text ui-transition ui-focus"
    aria-label={searchOpen ? 'Fechar busca' : 'Abrir busca'}
    aria-expanded={searchOpen}
    aria-haspopup="dialog"
  >
    <Icon icon="ri:search-line" class="h-6 w-6" />
  </button>

  <!-- 🌗 Toggle de tema — mobile + desktop -->
  <button
    type="button"
    on:click={toggleTheme}
    class="flex h-10 w-10 items-center justify-center rounded bg-transparent text-secondary-text hover:text-primary-text ui-transition ui-focus"
    aria-pressed={theme === 'dark' ? 'true' : 'false'}
    aria-label={`Ativar modo ${theme === 'light' ? 'escuro' : 'claro'}`}
  >
    {#if theme === 'light'}
      <Icon icon="solar:sun-2-bold" class="h-5 w-5" />
    {:else}
      <Icon icon="solar:moon-bold" class="h-5 w-5" />
    {/if}
  </button>
</div>

{#if searchOpen}
  <div
    bind:this={searchWrapper}
    use:portal
    class="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 md:pt-24 pb-6"
    on:pointerdown={handleWrapperPointerDown}
  >
    <!-- BACKDROP -->
    <div
      class="absolute inset-0 bg-primary-bg/70 backdrop-blur-sm"
      on:pointerdown|preventDefault|stopPropagation={() => { closeSearch({ restoreFocus: false }); }}
      on:click|preventDefault|stopPropagation
    ></div>

    <section
      bind:this={searchDialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-search-title"
      class="relative z-10 w-full max-w-xl lg:max-w-[40rem] overflow-hidden rounded border border-border-ink/80 bg-card-bg shadow-xl"
      on:keydown={handleInputKeydown}
      on:click|stopPropagation
    >
      <h2 id="global-search-title" class="sr-only">Busca</h2>

      <div class="flex flex-col gap-4 p-4">
        <div class="flex items-center gap-3 rounded border border-border-ink/70 bg-card-bg px-3 py-2.5 shadow-sm">
          <Icon icon="ri:search-line" class="h-5 w-5 text-secondary-text" />
          <label class="sr-only" for="global-search-input">Pesquisar</label>
          <input
            id="global-search-input"
            bind:this={searchInput}
            bind:value={searchQuery}
            type="search"
            inputmode="search"
            placeholder="Pesquise por tópicos, palavras ou postagens"
            class="flex-1 bg-transparent text-base text-primary-text placeholder:text-muted-text focus:outline-none"
            autocomplete="off" spellcheck="false"
          />
        </div>

        {#if searchError}
          <p class="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{searchError}</p>
        {:else if isLoadingSearch}
          <p class="px-1 text-sm text-secondary-text">Carregando índice...</p>
        {:else if (isMobile ? mobileVisible.length : desktopVisible.length)}
          <div class={isMobile ? 'max-h-[60vh] overflow-y-auto' : ''}>
            <ul class="flex flex-col gap-2 pr-1">
              {#each (isMobile ? mobileVisible : desktopVisible) as result}
                <li>
                  <a
                    href={result.url}
                    class="block rounded border border-transparent px-3 py-2.5 ui-transition hover:border-border-ink/70 hover:bg-surface-bg ui-focus"
                    on:click={() => closeSearch({ restoreFocus: false })}
                  >
                    <div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-text">
                      <span>{result.category}</span>
                      {#if result.pubDate}<span aria-hidden="true">/</span><span>{formatDate(result.pubDate)}</span>{/if}
                    </div>
                    <p class="mt-1 text-base font-semibold text-primary-text">{result.title}</p>
                    {#if result.description || result.excerpt}
                      <p class="mt-0.5 text-sm text-secondary-text">{cleanSnippet(result.description || result.excerpt)}</p>
                    {/if}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {:else}
          <p class="px-1 text-sm text-secondary-text">
            {trimmedQuery ? 'Nada encontrado ainda.' : 'Comece a digitar para buscar.'}
          </p>
        {/if}
      </div>
    </section>
  </div>
{/if}
