<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";
  import { usePicker, usePickerStore } from "./context";
  let {
    direction,
    children,
    ...attributes
  }: HTMLButtonAttributes & { direction: -1 | 1; children?: Snippet } =
    $props();
  const store = usePickerStore(),
    state = usePicker();
</script>

<button
  {...attributes}
  type="button"
  disabled={attributes.disabled || $state.options.disabled}
  onclick={(event) => {
    attributes.onclick?.(event);
    if (!event.defaultPrevented) store.navigate(direction);
  }}
  >{#if children}{@render children()}{:else}{direction < 0
      ? "Previous month"
      : "Next month"}{/if}</button
>
