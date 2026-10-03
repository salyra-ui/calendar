<script lang="ts">
  import { onMount, untrack, type Snippet } from "svelte";
  import {
    createPickerStore,
    type PickerStore,
    type PickerOptions,
    type PickerValue,
  } from "../core";
  import { providePicker } from "./context";
  let {
    store: provided,
    options = {},
    value = $bindable(),
    onValueChange,
    children,
  }: {
    store?: PickerStore;
    options?: PickerOptions;
    value?: PickerValue;
    onValueChange?: (value: PickerValue) => void;
    children: Snippet;
  } = $props();
  const store = providePicker(
    untrack(() => {
      if (!provided)
        return createPickerStore({
          ...options,
          value: value === undefined ? options.value : value,
        });
      provided.setOptions(options);
      if (value !== undefined) provided.setValue(value);
      return provided;
    }),
  );
  $effect(() => {
    if (value !== undefined) store.setValue(value);
  });
  $effect(() => {
    store.setOptions(options);
  });
  onMount(() =>
    store.subscribeValue((next) => {
      value = next;
      onValueChange?.(next);
    }),
  );
</script>

{@render children()}
