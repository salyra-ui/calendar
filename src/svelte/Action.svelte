<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";
  import { usePicker, usePickerStore } from "./context";
  let {
    action,
    children,
    ...attributes
  }: HTMLButtonAttributes & {
    action: "apply" | "cancel" | "clear";
    children?: Snippet;
  } = $props();
  const store = usePickerStore(),
    state = usePicker();
</script>

<button
  {...attributes}
  type="button"
  disabled={attributes.disabled || $state.options.disabled}
  onclick={(event) => {
    attributes.onclick?.(event);
    if (!event.defaultPrevented) store[action]();
  }}
  >{#if children}{@render children()}{:else}{action}{/if}</button
>
