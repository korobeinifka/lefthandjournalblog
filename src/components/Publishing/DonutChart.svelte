<script lang="ts">
  export type DonutSegment = {
    label: string;
    value: number;
    color: string;
  };

  export let segments: DonutSegment[] = [];
  export let total = 0;
  export let trackColor = "rgba(var(--border-ink), 0.5)";

  const radius = 56;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  $: computedSegments = (() => {
    let offset = 0;
    return segments.map((segment) => {
      const length = total > 0 ? (segment.value / total) * circumference : 0;
      const current = { ...segment, length, offset };
      offset -= length;
      return current;
    });
  })();
</script>

<svg
  viewBox="0 0 140 140"
  role="img"
  aria-label="Category distribution"
  class="h-32 w-32"
>
  <circle
    cx="70"
    cy="70"
    r={radius}
    fill="transparent"
    stroke={trackColor}
    stroke-width={strokeWidth}
    stroke-dasharray={`${circumference} ${circumference}`}
    stroke-dashoffset={0}
    class="opacity-30"
  />

  {#each computedSegments as segment (segment.label)}
    <circle
      cx="70"
      cy="70"
      r={radius}
      fill="transparent"
      stroke={segment.color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-dasharray={`${segment.length} ${circumference}`}
      stroke-dashoffset={segment.offset}
      class="transition-[stroke-dashoffset] duration-500 ease-out"
    />
  {/each}
</svg>
