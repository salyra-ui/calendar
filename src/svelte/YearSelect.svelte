<script lang="ts">
  import type { HTMLSelectAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";
  import { usePicker, usePickerStore } from "./context";
  let {
    from = 1900,
    to = 2100,
    children,
    ...attributes
  }: HTMLSelectAttributes & {
    from?: number;
    to?: number;
    children?: Snippet;
  } = $props();
  const store = usePickerStore(),
    state = usePicker();
</script>

<select
  {...attributes}
  disabled={attributes.disabled || $state.options.disabled}
  value={$state.visibleMonth.year}
  onchange={(event) => {
    attributes.onchange?.(event);
    if (!event.defaultPrevented)
      store.setVisibleMonth({
        ...$state.visibleMonth,
        year: Number(event.currentTarget.value),
      });
  }}
>
  {#if children}{@render children()}{:else}{#each Array.from({ length: to - from + 1 }, (_, i) => from + i) as value}<option
        {value}>{value}</option
      >{/each}{/if}
</select>
