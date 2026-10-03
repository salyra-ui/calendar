<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { onMount, type Snippet } from "svelte";
  import { bindDayTrigger, dayTriggerAttributes } from "../core";
  import { usePickerStore, usePicker } from "./context";
  let {
    date,
    outside = false,
    onSelect,
    children,
    ...attributes
  }: HTMLButtonAttributes & {
    date: string;
    outside?: boolean;
    onSelect?: (date: string) => void;
    children?: Snippet;
  } = $props();
  const store = usePickerStore();
  const picker = usePicker();
  let element: HTMLButtonElement;
  const flags = $derived.by(() => {
    $picker;
    return dayTriggerAttributes(store, date, outside);
  });
  $effect(() =>
    bindDayTrigger(element, store, date, {
      outside,
      onSelect,
      disabled: attributes.disabled ?? false,
    }),
  );
</script>

<button
  {...attributes}
  {...flags}
  data-day-trigger
  disabled={attributes.disabled || store.getDay(date).disabled}
  tabindex={$picker.focusedDate === date && !outside ? 0 : -1}
  type="button"
  bind:this={element}
  >{#if children}{@render children()}{:else}{Number(
      date.slice(-2),
    )}{/if}</button
>
