<script lang="ts">
  import { onMount } from "svelte";

  const STORAGE_KEY = "__lfjPublishingGateUnlocked";
  const expectedToken = (import.meta.env.PUBLIC_PUBLISHING_GATE_TOKEN ?? "").trim();

  let passcode = "";
  let unlocked = false;
  let errorMessage = "";

  const persistUnlocked = () => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "true");
    } catch (error) {
      console.warn("Unable to persist publishing gate state", error);
    }
  };

  const restoreUnlocked = () => {
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === "true";
    } catch (error) {
      console.warn("Unable to read publishing gate state", error);
      return false;
    }
  };

  const unlock = () => {
    unlocked = true;
    errorMessage = "";
    persistUnlocked();
  };

  const handleSubmit = () => {
    const trimmed = passcode.trim();

    if (!expectedToken) {
      unlock();
      return;
    }

    if (trimmed === expectedToken) {
      unlock();
    } else {
      errorMessage = "Incorrect passcode. Try again or connect with the editorial team.";
    }
  };

  onMount(() => {
    if (typeof window === "undefined") return;
    if (restoreUnlocked()) {
      unlocked = true;
    }
  });
</script>

{#if unlocked}
  <slot />
{:else}
  <section class="flex min-h-[60vh] items-center justify-center py-24">
    <div class="w-full max-w-md rounded-3xl border border-border-ink/70 bg-card-bg/95 px-8 py-10 text-center shadow-lg shadow-black/5">
      <p class="text-xs font-semibold uppercase tracking-[0.35em] text-muted-text">Publishing studio</p>
      <h1 class="mt-4 font-display text-3xl text-primary-text">Unlock the workspace</h1>
      <p class="mt-3 text-sm text-secondary-text">
        This private space keeps pitches and production details within the editorial circle. Enter the shared passcode to continue.
      </p>

      <form
        class="mt-8 space-y-4 text-left"
        on:submit|preventDefault={handleSubmit}
      >
        <label class="flex flex-col gap-2">
          <span class="text-xs font-semibold uppercase tracking-[0.3em] text-muted-text">Passcode</span>
          <input
            type="password"
            class="w-full rounded-2xl border border-border-ink/60 bg-surface-bg/80 px-4 py-3 text-base text-primary-text shadow-sm transition focus:border-border-ink focus:outline-none focus:ring-2 focus:ring-border-ink/60"
            bind:value={passcode}
            autocomplete="current-password"
            aria-invalid={errorMessage ? "true" : "false"}
            aria-describedby={errorMessage ? "publishing-gate-error" : undefined}
            required
          />
        </label>

        {#if errorMessage}
          <p id="publishing-gate-error" class="text-sm text-red-500" role="status" aria-live="polite">
            {errorMessage}
          </p>
        {/if}

        <button
          type="submit"
          class="inline-flex w-full items-center justify-center rounded-full bg-primary-text px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-primary-bg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-text/30"
        >
          Unlock
        </button>
      </form>

      <p class="mt-6 text-xs text-muted-text">
        Need the passcode? Ping the managing editor for access.
      </p>
    </div>
  </section>
{/if}
