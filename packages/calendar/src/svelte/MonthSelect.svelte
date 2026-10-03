<script lang="ts">
  import type { HTMLSelectAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";
  import { usePicker, usePickerStore } from "./context";
  let {
    children,
    ...attributes
  }: HTMLSelectAttributes & { children?: Snippet } = $props();
  const store = usePickerStore(),
    state = usePicker();
</script>

<select
  {...attributes}
  disabled={attributes.disabled || $state.options.disabled}
  value={$state.visibleMonth.month}
  onchange={(event) => {
    attributes.onchange?.(event);
    if (!event.defaultPrevented)
      store.setVisibleMonth({
        ...$state.visibleMonth,
        month: Number(event.currentTarget.value),
      });
  }}
>
  {#if children}{@render children()}{:else}{#each Array.from({ length: 12 }, (_, i) => i + 1) as value}<option
        {value}>{value}</option
      >{/each}{/if}
</select>
