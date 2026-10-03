<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";
  import { dayAttributes, type PickerSnapshot } from "../core";
  import { usePicker, usePickerStore } from "./context";
  let {
    date,
    outside = false,
    children,
    ...attributes
  }: HTMLAttributes<HTMLDivElement> & {
    date: string;
    outside?: boolean;
    children?: Snippet<[PickerSnapshot]>;
  } = $props();
  const store = usePickerStore(),
    picker = usePicker();
  const flags = $derived.by(() => {
    $picker;
    return dayAttributes(store, date, outside);
  });
</script>

<div {...attributes} {...flags} role="gridcell" data-part="cell">
  {#if children}{@render children($picker)}{/if}
</div>
