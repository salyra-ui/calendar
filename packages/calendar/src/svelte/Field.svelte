<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { bindDateField, pointFor, type Endpoint } from "../core";
  import { usePickerStore } from "./context";
  let {
    endpoint = "start",
    ...attributes
  }: HTMLInputAttributes & { endpoint?: Endpoint } = $props();
  const store = usePickerStore();
  let element: HTMLInputElement;
  $effect(() => {
    attributes.disabled;
    attributes.readonly;
    return bindDateField(element, store, endpoint);
  });
</script>

<input
  {...attributes}
  value={attributes.value ??
    pointFor(store.getSnapshot().draft, endpoint)?.date ??
    ""}
  type="text"
  placeholder={attributes.placeholder ?? "YYYY-MM-DD"}
  bind:this={element}
/>
