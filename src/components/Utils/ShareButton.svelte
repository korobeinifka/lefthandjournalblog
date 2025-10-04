<script lang="ts">
  import Icon from '@iconify/svelte';
  export let url = '';
  export let title = 'Share';

  let copied = false;

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ url, title });
      } else {
        await navigator.clipboard.writeText(url);
        copied = true;
        setTimeout(() => (copied = false), 1500);
      }
    } catch {
      /* usuário cancelou/não suportado */
    }
  }
</script>

<button
  type="button"
  on:click={handleShare}
  class="inline-flex items-center rounded
         gap-2 md:gap-2
         px-2 py-1.5 md:px-2 md:py-1
         text-[11px] md:text-xs font-semibold uppercase
         tracking-[0.16em] md:tracking-[0.20em]
         text-secondary-text hover:text-primary-text
         bg-transparent border-0 shadow-none
         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text"
  aria-label="Share this post"
>
  <Icon icon="ri:share-forward-line" class="h-3.5 w-3.5 md:h-4 md:w-4" />
  <span>{copied ? 'COPIED' : 'SHARE'}</span>
</button>
