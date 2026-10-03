<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";
  let {
    date,
    children,
    ...attributes
  }: HTMLAttributes<HTMLSpanElement> & { date: string; children?: Snippet } =
    $props();
</script>

<span {...attributes} data-part="number"
  >{#if children}{@render children()}{:else}{Number(date.slice(-2))}{/if}</span
>
