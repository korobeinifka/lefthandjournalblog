<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { PublishingPost } from "./types";

  export let open = false;
  export let post: PublishingPost | null = null;

  const dispatch = createEventDispatcher();

  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const escapeAttribute = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");

  const inlineMath = (expression: string) => {
    const escaped = escapeHtml(expression.trim());
    return `<span class=\"inline-flex items-center gap-1 rounded-full bg-surface-bg/80 px-2 py-1 font-mono text-sm text-primary-text\">${escaped}</span>`;
  };

  const applyInlineFormatting = (input: string) => {
    let formatted = escapeHtml(input);

    formatted = formatted.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, url) => {
      const safeUrl = escapeAttribute(url.trim());
      const safeAlt = escapeAttribute(alt.trim() || "Inline illustration");
      return `<img src=\"${safeUrl}\" alt=\"${safeAlt}\" class=\"my-6 w-full rounded-2xl border border-border-ink/50 bg-surface-bg\" loading=\"lazy\" />`;
    });

    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
      const safeUrl = escapeAttribute(url.trim());
      const safeLabel = escapeHtml(label.trim());
      return `<a href=\"${safeUrl}\" class=\"underline decoration-border-ink/70 decoration-1 underline-offset-2 transition hover:decoration-primary-text\" target=\"_blank\" rel=\"noopener noreferrer\">${safeLabel}</a>`;
    });

    formatted = formatted.replace(/`([^`]+)`/g, (_match, code) => `<code class=\"rounded bg-surface-bg px-1 py-0.5 text-sm\">${code}</code>`);
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, (_match, text) => `<strong>${text}</strong>`);
    formatted = formatted.replace(/_([^_]+)_/g, (_match, text) => `<em>${text}</em>`);
    formatted = formatted.replace(/\\\((.+?)\\\)/g, (_match, expression) => inlineMath(expression));

    return formatted;
  };

  const renderMarkdown = (markdown: string) => {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let listItems: string[] = [];
    let quoteLines: string[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];

    const flushList = () => {
      if (listItems.length === 0) return;
      html += `<ul class=\"list-disc space-y-2 pl-6 marker:text-secondary-text\">${listItems
        .map((item) => `<li>${applyInlineFormatting(item)}</li>`)
        .join("")}</ul>`;
      listItems = [];
    };

    const flushQuote = () => {
      if (quoteLines.length === 0) return;
      html += `<blockquote class=\"border-l-4 border-border-ink/70 pl-5 text-secondary-text space-y-2\">${quoteLines
        .map((line) => `<p>${applyInlineFormatting(line)}</p>`)
        .join("")}</blockquote>`;
      quoteLines = [];
    };

    const flushCode = () => {
      if (!inCodeBlock) return;
      html += `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`;
      inCodeBlock = false;
      codeLines = [];
    };

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith("```")) {
        if (!inCodeBlock) {
          flushList();
          flushQuote();
          inCodeBlock = true;
          codeLines = [];
        } else {
          flushCode();
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      if (trimmed.length === 0) {
        flushList();
        flushQuote();
        continue;
      }

      if (trimmed.startsWith("- ")) {
        flushQuote();
        listItems.push(trimmed.slice(2));
        continue;
      }

      if (trimmed.startsWith(">")) {
        flushList();
        quoteLines.push(trimmed.replace(/^>\s?/, ""));
        continue;
      }

      flushList();
      flushQuote();

      const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
      if (headingMatch) {
        const level = Math.min(headingMatch[1].length + 1, 4);
        html += `<h${level} class=\"font-display text-primary-text\">${applyInlineFormatting(
          headingMatch[2]
        )}</h${level}>`;
        continue;
      }

      html += `<p>${applyInlineFormatting(trimmed)}</p>`;
    }

    flushCode();
    flushList();
    flushQuote();

    return html;
  };

  $: renderedBody = post ? renderMarkdown(post.body || "") : "";

  const formattedDate = (value: string) => {
    try {
      return new Date(value).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return value;
    }
  };

  function close() {
    dispatch("close");
  }
</script>

{#if open && post}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-primary-text/40 backdrop-blur-sm px-4 py-6">
    <div class="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-border-ink/70 bg-card-bg shadow-xl shadow-black/20">
      <button
        type="button"
        class="absolute right-4 top-4 inline-flex items-center justify-center rounded-full border border-border-ink/60 bg-card-bg px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary-text transition hover:border-primary-text hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text"
        on:click={close}
      >
        Close
      </button>
      <article class="max-h-[80vh] overflow-y-auto p-6 sm:p-10">
        <header class="flex flex-col gap-6">
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-muted-text">{post.category}</p>
          <h2 class="font-display text-3xl leading-tight text-primary-text sm:text-4xl">{post.title}</h2>
          <p class="text-lg text-secondary-text">{post.description}</p>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-secondary-text">
            <span class="font-semibold text-primary-text">Preview</span>
            <span aria-hidden="true">•</span>
            <time datetime={post.pubDate}>{formattedDate(post.pubDate)}</time>
            <span aria-hidden="true">•</span>
            <span class="uppercase tracking-[0.25em] text-muted-text">{post.status}</span>
          </div>
          {#if post.heroImage}
            <figure class="overflow-hidden rounded-2xl border border-border-ink/60 bg-surface-bg">
              <img src={post.heroImage} alt={post.heroImageAlt || post.title} class="h-full w-full object-cover" loading="lazy" />
            </figure>
          {/if}
        </header>
        <section class="prose prose-neutral mt-10 max-w-none text-primary-text prose-headings:font-display prose-headings:text-primary-text prose-strong:text-primary-text prose-blockquote:border-l-4 prose-blockquote:border-border-ink prose-blockquote:pl-5 prose-blockquote:text-secondary-text prose-code:rounded prose-code:bg-surface-bg prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-pre:bg-surface-bg">
          {@html renderedBody}
        </section>
      </article>
    </div>
  </div>
{/if}
