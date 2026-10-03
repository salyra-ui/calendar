<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";
  let {
    children,
    ...attributes
  }: HTMLAttributes<HTMLDivElement> & { children?: Snippet } = $props();
</script>

<div {...attributes} role="grid" data-part="grid">
  {#if children}{@render children()}{/if}
</div>
