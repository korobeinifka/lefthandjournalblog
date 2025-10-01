<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let value = "";
  export let label = "Body";
  export let placeholder = "Draft your narrative";
  export let id = "publishing-body";

  const dispatch = createEventDispatcher();
  let textareaRef: HTMLTextAreaElement | null = null;

  const formattingActions: { id: string; label: string; description: string }[] = [
    { id: "h2", label: "H2", description: "Insert a section heading" },
    { id: "h3", label: "H3", description: "Insert a subheading" },
    { id: "caps", label: "CAPS", description: "Transform selection to all caps" },
    { id: "bold", label: "Bold", description: "Wrap selection in **bold**" },
    { id: "italic", label: "Italic", description: "Wrap selection in _italic_" },
    { id: "list", label: "List", description: "Start a bulleted list" },
    { id: "quote", label: "Quote", description: "Insert a pull quote" },
    { id: "code", label: "Code", description: "Insert a fenced code block" },
    { id: "math", label: "Math", description: "Wrap selection in inline math markers" },
    { id: "image", label: "Image", description: "Insert an inline image" },
    { id: "attachment", label: "File", description: "Insert an inline attachment" },
  ];

  function updateValue(next: string) {
    value = next;
    dispatch("change", { value });
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    updateValue(target.value);
  }

  function applyFormatting(actionId: string) {
    if (!textareaRef) return;
    const textarea = textareaRef;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const currentValue = textarea.value;
    const selectedText = currentValue.slice(startPos, endPos) || "";

    const commitChange = (nextValue: string, cursorStart: number, cursorEnd: number) => {
      updateValue(nextValue);
      requestAnimationFrame(() => {
        textareaRef?.setSelectionRange(cursorStart, cursorEnd);
        textareaRef?.focus();
      });
    };

    const insertInline = (before: string, after = "") => {
      const insertion = before + selectedText + after;
      const nextValue = currentValue.slice(0, startPos) + insertion + currentValue.slice(endPos);
      const cursorStart = startPos + before.length;
      const cursorEnd = cursorStart + selectedText.length;
      commitChange(nextValue, cursorEnd, cursorEnd - after.length);
    };

    const insertBlock = (block: string) => {
      const needsPrefix = startPos > 0 && currentValue[startPos - 1] !== "\n";
      const needsSuffix = endPos < currentValue.length && currentValue[endPos] !== "\n";
      const prefix = needsPrefix ? "\n" : "";
      const suffix = needsSuffix ? "\n" : "";
      const blockValue = `${prefix}${block}${suffix}`;
      const nextValue = currentValue.slice(0, startPos) + blockValue + currentValue.slice(endPos);
      const cursorPoint = startPos + blockValue.length;
      commitChange(nextValue, cursorPoint, cursorPoint);
    };

    switch (actionId) {
      case "h2":
        insertInline("## ");
        break;
      case "h3":
        insertInline("### ");
        break;
      case "caps": {
        const nextValue =
          currentValue.slice(0, startPos) + selectedText.toUpperCase() + currentValue.slice(endPos);
        const cursorStart = startPos;
        const cursorEnd = startPos + selectedText.length;
        commitChange(nextValue, cursorStart, cursorEnd);
        break;
      }
      case "bold":
        insertInline("**", "**");
        break;
      case "italic":
        insertInline("_", "_");
        break;
      case "list":
        insertBlock(`- ${selectedText || "List item"}`);
        break;
      case "quote":
        insertBlock(`> ${selectedText || "Pull a resonant line and place it here."}`);
        break;
      case "code":
        insertBlock("```\n" + (selectedText || "const calm = true;") + "\n```");
        break;
      case "math":
        insertInline("\\(", "\\)");
        break;
      case "image":
        insertInline("![Describe the scene](https://)");
        break;
      case "attachment":
        insertInline("[Attachment title](https://)");
        break;
    }
  }
</script>

<div class="space-y-3">
  <label for={id} class="text-sm font-semibold uppercase tracking-[0.35em] text-muted-text">{label}</label>
  <div class="space-y-2 rounded-2xl border border-border-ink/60 bg-surface-bg/80 p-3 shadow-sm">
    <div class="flex flex-wrap gap-2">
      {#each formattingActions as action}
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full border border-border-ink/60 bg-card-bg px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary-text transition hover:border-primary-text hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text"
          title={action.description}
          on:click={() => applyFormatting(action.id)}
        >
          {action.label}
        </button>
      {/each}
    </div>
    <textarea
      id={id}
      bind:this={textareaRef}
      bind:value
      rows={12}
      placeholder={placeholder}
      class="w-full resize-y rounded-2xl border border-border-ink/60 bg-card-bg px-4 py-3 text-base text-primary-text shadow-inner focus:border-primary-text focus:outline-none focus:ring-2 focus:ring-border-ink/60"
      on:input={handleInput}
    />
  </div>
</div>
