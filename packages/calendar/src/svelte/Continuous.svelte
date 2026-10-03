<script lang="ts">
  import { untrack } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import {
    bindMonthScroller,
    monthScrollerMarkup,
    type MonthScrollerOptions,
  } from "../core";
  import { usePickerStore } from "./context";
  let {
    options = {},
    ...attributes
  }: HTMLAttributes<HTMLDivElement> & { options?: MonthScrollerOptions } =
    $props();
  const store = usePickerStore();
  let element: HTMLDivElement;
  const html = untrack(() => monthScrollerMarkup(store, options));
  $effect(() => bindMonthScroller(element, store, options));
</script>

<div {...attributes} bind:this={element}>{@html html}</div>
