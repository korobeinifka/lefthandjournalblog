<script lang="ts">
  import RichTextEditor from "./RichTextEditor.svelte";
  import PreviewModal from "./PreviewModal.svelte";
  import DonutChart from "./DonutChart.svelte";
  import type { PublishingPost, PublishingStatus } from "./types";

  export let initialPosts: PublishingPost[] = [];
  export let categoryOptions: string[] = [];

  const palette = [
    "rgb(var(--primary-text))",
    "rgba(var(--secondary-text), 0.9)",
    "rgba(var(--muted-text), 0.9)",
    "rgba(var(--primary-text), 0.6)",
    "rgba(var(--secondary-text), 0.6)",
  ];

  const buttonBaseClass =
    "inline-flex items-center justify-center gap-2 rounded-full border border-border-ink/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text";
  const primaryButtonClass =
    `${buttonBaseClass} bg-primary-text text-primary-bg hover:bg-primary-bg hover:text-primary-text hover:border-primary-text`;
  const secondaryButtonClass =
    `${buttonBaseClass} bg-card-bg text-secondary-text hover:text-primary-text hover:border-primary-text`;
  const ghostButtonClass =
    `${buttonBaseClass} bg-transparent text-secondary-text hover:bg-primary-text hover:text-primary-bg hover:border-primary-text`;

  const inputClass =
    "w-full rounded-2xl border border-border-ink/60 bg-surface-bg/80 px-4 py-3 text-base text-primary-text shadow-sm transition focus:border-primary-text focus:outline-none focus:ring-2 focus:ring-border-ink/60";

  type FormState = {
    title: string;
    description: string;
    category: string;
    pubDate: string;
    heroImage: string;
    heroImageAlt: string;
    body: string;
  };

  const todayInputValue = () => new Date().toISOString().slice(0, 10);

  const initialCategory = categoryOptions[0] ?? "Editorial";

  const emptyForm = (): FormState => ({
    title: "",
    description: "",
    category: initialCategory,
    pubDate: todayInputValue(),
    heroImage: "",
    heroImageAlt: "",
    body: "",
  });

  let form: FormState = emptyForm();
  let drafts: PublishingPost[] = [];
  let published: PublishingPost[] = initialPosts.filter((post) => post.status !== "draft");
  let editingId: string | null = null;
  let editingSource: "drafts" | "published" | null = null;
  let previewOpen = false;
  let previewTarget: PublishingPost | null = null;

  let draftFilter = "all";
  let draftSort = "recent";
  let publishedFilter = "all";
  let publishedSort = "recent";

  const sortOptions = [
    { value: "recent", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "title", label: "Title A-Z" },
  ];

  $: if (categoryOptions.length > 0 && !categoryOptions.includes(form.category)) {
    form = { ...form, category: categoryOptions[0] };
  }

  const computeStatus = (dateInput: string): PublishingStatus => {
    const targetDate = new Date(dateInput);
    const now = new Date();
    return targetDate > now ? "scheduled" : "published";
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const buildPostFromForm = (status: PublishingStatus, id: string): PublishingPost => ({
    id,
    title: form.title.trim() || "Untitled draft",
    description: form.description.trim() || "Refine this description before publishing.",
    category: form.category,
    pubDate: new Date(form.pubDate).toISOString(),
    heroImage: form.heroImage.trim(),
    heroImageAlt: form.heroImageAlt.trim(),
    status,
    body: form.body,
  });

  function resetForm() {
    form = emptyForm();
    editingId = null;
    editingSource = null;
  }

  function populateForm(post: PublishingPost, source: "drafts" | "published") {
    form = {
      title: post.title,
      description: post.description,
      category: post.category,
      pubDate: post.pubDate.slice(0, 10),
      heroImage: post.heroImage ?? "",
      heroImageAlt: post.heroImageAlt ?? "",
      body: post.body,
    };
    editingId = post.id;
    editingSource = source;
  }

  function ensureId() {
    return editingId ?? crypto.randomUUID();
  }

  function saveDraft() {
    const id = editingSource === "drafts" ? ensureId() : crypto.randomUUID();
    const draft = buildPostFromForm("draft", id);
    if (editingSource === "drafts") {
      drafts = drafts.map((item) => (item.id === id ? draft : item));
    } else {
      drafts = [draft, ...drafts];
    }
    editingId = draft.id;
    editingSource = "drafts";
  }

  function publishFromForm() {
    const id =
      editingSource === "drafts" || editingSource === "published"
        ? ensureId()
        : crypto.randomUUID();
    const status = computeStatus(form.pubDate);
    const post = buildPostFromForm(status, id);
    if (editingSource === "published") {
      published = published.map((item) => (item.id === id ? post : item));
    } else {
      if (editingSource === "drafts") {
        drafts = drafts.filter((item) => item.id !== id);
      }
      published = [post, ...published];
    }
    editingId = post.id;
    editingSource = "published";
  }

  function previewForm() {
    const id =
      editingSource === "drafts" || editingSource === "published"
        ? ensureId()
        : crypto.randomUUID();
    const status = editingSource === "drafts" ? "draft" : computeStatus(form.pubDate);
    previewTarget = buildPostFromForm(status, id);
    previewOpen = true;
  }

  function removePost(post: PublishingPost, source: "drafts" | "published") {
    if (source === "drafts") {
      drafts = drafts.filter((item) => item.id !== post.id);
    } else {
      published = published.filter((item) => item.id !== post.id);
    }
    if (editingId === post.id) {
      resetForm();
    }
  }

  function duplicatePost(post: PublishingPost) {
    const duplicate: PublishingPost = {
      ...post,
      id: crypto.randomUUID(),
      title: `${post.title} (Copy)`
        .replace(/\s+/g, " ")
        .trim(),
      status: "draft",
    };
    drafts = [duplicate, ...drafts];
    populateForm(duplicate, "drafts");
  }

  function publishPost(post: PublishingPost) {
    const status = computeStatus(post.pubDate);
    const updated: PublishingPost = { ...post, status };
    drafts = drafts.filter((item) => item.id !== post.id);
    published = [updated, ...published.filter((item) => item.id !== post.id)];
  }

  function unpublishPost(post: PublishingPost) {
    const draft: PublishingPost = { ...post, status: "draft" };
    published = published.filter((item) => item.id !== post.id);
    drafts = [draft, ...drafts];
  }

  function previewPost(post: PublishingPost) {
    previewTarget = post;
    previewOpen = true;
  }

  const applyFilterAndSort = (
    posts: PublishingPost[],
    filterValue: string,
    sortValue: string
  ) => {
    let filtered = posts;
    if (filterValue !== "all") {
      filtered = filtered.filter((post) => post.category === filterValue);
    }

    const sorted = [...filtered];
    switch (sortValue) {
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.pubDate).valueOf() - new Date(b.pubDate).valueOf());
        break;
      case "recent":
      default:
        sorted.sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf());
        break;
    }

    return sorted;
  };

  $: filteredDrafts = applyFilterAndSort(drafts, draftFilter, draftSort);
  $: filteredPublished = applyFilterAndSort(published, publishedFilter, publishedSort);

  $: totalDrafts = drafts.length;
  $: totalPublished = published.filter((post) => post.status === "published").length;
  $: totalScheduled = published.filter((post) => post.status === "scheduled").length;
  $: totalPosts = totalDrafts + published.length;

  $: categoryCounts = (() => {
    const counts = new Map<string, number>();
    for (const post of [...drafts, ...published]) {
      const key = post.category || "Uncategorized";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([label, value]) => ({ label, value }));
  })();

  $: donutSegments = categoryCounts.map((entry, index) => ({
    label: entry.label,
    value: entry.value,
    color: palette[index % palette.length],
  }));

  $: donutTotal = categoryCounts.reduce((total, entry) => total + entry.value, 0);

  const legendBadgeClass =
    "inline-flex items-center gap-2 rounded-full border border-border-ink/50 bg-surface-bg/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-secondary-text";
</script>

<div class="space-y-12">
  <section class="space-y-6 rounded-3xl border border-border-ink/60 bg-card-bg/95 p-6 shadow-md shadow-black/10 sm:p-10">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-2">
        <h2 class="font-display text-2xl text-primary-text sm:text-3xl">Metrics at a glance</h2>
        <p class="text-sm text-secondary-text">
          Track how drafts and live posts spread across categories before you publish the next dispatch.
        </p>
      </div>
      <DonutChart segments={donutSegments} total={donutTotal} />
    </div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-border-ink/40 bg-surface-bg/60 p-4">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-muted-text">Total posts</p>
        <p class="mt-2 text-3xl font-semibold text-primary-text">{totalPosts}</p>
      </div>
      <div class="rounded-2xl border border-border-ink/40 bg-surface-bg/60 p-4">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-muted-text">Drafts</p>
        <p class="mt-2 text-3xl font-semibold text-primary-text">{totalDrafts}</p>
      </div>
      <div class="rounded-2xl border border-border-ink/40 bg-surface-bg/60 p-4">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-muted-text">Published</p>
        <p class="mt-2 text-3xl font-semibold text-primary-text">{totalPublished}</p>
      </div>
      <div class="rounded-2xl border border-border-ink/40 bg-surface-bg/60 p-4">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-muted-text">Scheduled</p>
        <p class="mt-2 text-3xl font-semibold text-primary-text">{totalScheduled}</p>
      </div>
    </div>
    <div class="flex flex-wrap gap-3">
      {#if donutSegments.length === 0}
        <span class={legendBadgeClass}>No categories yet</span>
      {:else}
        {#each donutSegments as segment, index}
          <span class={legendBadgeClass} style={`border-color: ${segment.color}; color: ${segment.color}`}>
            <span class="h-2 w-2 rounded-full" style={`background-color: ${segment.color}`}></span>
            {segment.label} · {segment.value}
          </span>
        {/each}
      {/if}
    </div>
  </section>

  <section class="space-y-8 rounded-3xl border border-border-ink/60 bg-card-bg/95 p-6 shadow-md shadow-black/10 sm:p-10">
    <header class="space-y-2">
      <h2 class="font-display text-2xl text-primary-text sm:text-3xl">Compose</h2>
      <p class="text-sm text-secondary-text">
        Shape the next essay with the same calm cadence readers expect on the live site.
      </p>
    </header>

    <form class="space-y-6">
      <div class="grid gap-5 md:grid-cols-2">
        <div class="space-y-2">
          <label for="publishing-title" class="text-sm font-semibold uppercase tracking-[0.35em] text-muted-text">Title</label>
          <input
            id="publishing-title"
            type="text"
            class={inputClass}
            bind:value={form.title}
            placeholder="Working headline"
          />
        </div>
        <div class="space-y-2">
          <label for="publishing-category" class="text-sm font-semibold uppercase tracking-[0.35em] text-muted-text"
            >Category</label
          >
          <select id="publishing-category" class={inputClass} bind:value={form.category}>
            {#each categoryOptions as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </div>
      </div>
      <div class="space-y-2">
        <label for="publishing-description" class="text-sm font-semibold uppercase tracking-[0.35em] text-muted-text"
          >Description</label
        >
        <textarea
          id="publishing-description"
          rows={3}
          class={`${inputClass} min-h-[120px]`}
          placeholder="One-line dek to situate the story"
          bind:value={form.description}
        ></textarea>
      </div>
      <div class="grid gap-5 md:grid-cols-2">
        <div class="space-y-2">
          <label for="publishing-date" class="text-sm font-semibold uppercase tracking-[0.35em] text-muted-text"
            >Publication date</label
          >
          <input id="publishing-date" type="date" class={inputClass} bind:value={form.pubDate} />
        </div>
        <div class="space-y-2">
          <label for="publishing-cover" class="text-sm font-semibold uppercase tracking-[0.35em] text-muted-text"
            >Cover image URL</label
          >
          <input
            id="publishing-cover"
            type="url"
            class={inputClass}
            bind:value={form.heroImage}
            placeholder="https://"
          />
        </div>
      </div>
      <div class="space-y-2">
        <label for="publishing-cover-alt" class="text-sm font-semibold uppercase tracking-[0.35em] text-muted-text"
          >Cover image alt text</label
        >
        <input
          id="publishing-cover-alt"
          type="text"
          class={inputClass}
          bind:value={form.heroImageAlt}
          placeholder="Describe the tone of the visual"
        />
      </div>

      <RichTextEditor bind:value={form.body} label="Body" placeholder="Write with long-form calm and precise rhythm." />

      <div class="flex flex-wrap gap-3 pt-2">
        <button type="button" class={primaryButtonClass} on:click={saveDraft}>
          {editingSource === "drafts" ? "Update draft" : "Save draft"}
        </button>
        <button type="button" class={secondaryButtonClass} on:click={publishFromForm}>
          {editingSource === "published" ? "Update publish" : "Publish"}
        </button>
        <button type="button" class={ghostButtonClass} on:click={previewForm}>Preview</button>
        <button type="button" class={ghostButtonClass} on:click={resetForm}>Clear form</button>
      </div>
    </form>
  </section>

  <section class="grid gap-8 lg:grid-cols-2">
    <div class="space-y-5 rounded-3xl border border-border-ink/60 bg-card-bg/95 p-6 shadow-md shadow-black/10">
      <header class="space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-display text-xl text-primary-text">Drafts</h3>
            <p class="text-sm text-secondary-text">Ideas still in refinement before going live.</p>
          </div>
          <button type="button" class={ghostButtonClass} on:click={resetForm}>New draft</button>
        </div>
        <div class="flex flex-wrap gap-3">
          <select class={`${inputClass} h-11 w-40 text-sm`} bind:value={draftFilter}>
            <option value="all">All categories</option>
            {#each categoryOptions as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
          <select class={`${inputClass} h-11 w-40 text-sm`} bind:value={draftSort}>
            {#each sortOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
      </header>
      <div class="space-y-3">
        {#if filteredDrafts.length === 0}
          <p class="rounded-2xl border border-dashed border-border-ink/50 bg-surface-bg/70 px-4 py-6 text-sm text-secondary-text">
            No drafts yet. Start a new entry to see it appear here.
          </p>
        {:else}
          {#each filteredDrafts as post}
            <article class="space-y-3 rounded-2xl border border-border-ink/50 bg-surface-bg/70 p-4">
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-1">
                  <h4 class="font-semibold text-primary-text">{post.title}</h4>
                  <p class="text-sm text-secondary-text">{post.description}</p>
                  <div class="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-text">
                    <span>{post.category}</span>
                    <span aria-hidden="true">•</span>
                    <time datetime={post.pubDate}>{formatDate(post.pubDate)}</time>
                  </div>
                </div>
                <span class="rounded-full bg-primary-text/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary-text">
                  Draft
                </span>
              </div>
              <div class="flex flex-wrap gap-2">
                <button type="button" class={secondaryButtonClass} on:click={() => populateForm(post, "drafts")}>Edit</button>
                <button type="button" class={ghostButtonClass} on:click={() => previewPost(post)}>Preview</button>
                <button type="button" class={primaryButtonClass} on:click={() => publishPost(post)}>Publish</button>
                <button type="button" class={ghostButtonClass} on:click={() => duplicatePost(post)}>Duplicate</button>
                <button type="button" class={ghostButtonClass} on:click={() => removePost(post, "drafts")}>Delete</button>
              </div>
            </article>
          {/each}
        {/if}
      </div>
    </div>

    <div class="space-y-5 rounded-3xl border border-border-ink/60 bg-card-bg/95 p-6 shadow-md shadow-black/10">
      <header class="space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-display text-xl text-primary-text">Published & Scheduled</h3>
            <p class="text-sm text-secondary-text">Live posts and those queued for upcoming dates.</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <select class={`${inputClass} h-11 w-40 text-sm`} bind:value={publishedFilter}>
            <option value="all">All categories</option>
            {#each categoryOptions as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
          <select class={`${inputClass} h-11 w-40 text-sm`} bind:value={publishedSort}>
            {#each sortOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
      </header>
      <div class="space-y-3">
        {#if filteredPublished.length === 0}
          <p class="rounded-2xl border border-dashed border-border-ink/50 bg-surface-bg/70 px-4 py-6 text-sm text-secondary-text">
            Nothing live yet. Publish a draft to populate this table.
          </p>
        {:else}
          {#each filteredPublished as post}
            <article class="space-y-3 rounded-2xl border border-border-ink/50 bg-surface-bg/70 p-4">
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-1">
                  <h4 class="font-semibold text-primary-text">{post.title}</h4>
                  <p class="text-sm text-secondary-text">{post.description}</p>
                  <div class="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-text">
                    <span>{post.category}</span>
                    <span aria-hidden="true">•</span>
                    <time datetime={post.pubDate}>{formatDate(post.pubDate)}</time>
                  </div>
                </div>
                <span class="rounded-full bg-primary-text/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary-text">
                  {post.status === "scheduled" ? "Scheduled" : "Published"}
                </span>
              </div>
              <div class="flex flex-wrap gap-2">
                <button type="button" class={secondaryButtonClass} on:click={() => populateForm(post, "published")}>Edit</button>
                <button type="button" class={ghostButtonClass} on:click={() => previewPost(post)}>Preview</button>
                <button type="button" class={ghostButtonClass} on:click={() => duplicatePost(post)}>Duplicate</button>
                <button type="button" class={ghostButtonClass} on:click={() => removePost(post, "published")}>Delete</button>
                <button type="button" class={primaryButtonClass} on:click={() => unpublishPost(post)}>Unpublish</button>
              </div>
            </article>
          {/each}
        {/if}
      </div>
    </div>
  </section>

  <PreviewModal open={previewOpen} post={previewTarget} on:close={() => (previewOpen = false)} />
</div>
