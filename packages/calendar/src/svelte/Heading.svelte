<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";
  import { formatMonth } from "../core";
  import { usePicker, usePickerStore } from "./context";
  let {
    offset = 0,
    children,
    ...attributes
  }: HTMLAttributes<HTMLHeadingElement> & {
    offset?: number;
    children?: Snippet;
  } = $props();
  const store = usePickerStore(),
    state = usePicker();
  const label = $derived.by(() => {
    $state;
    return formatMonth(store.getMonth(offset), $state.options.locale);
  });
</script>

<h3 {...attributes} aria-live="polite">
  {#if children}{@render children()}{:else}{label}{/if}
</h3>
