<script lang="ts">
  import type { HTMLSelectAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";
  import {
    bindTimeSegment,
    pointFor,
    timeSegmentValue,
    type Endpoint,
  } from "../core";
  import { usePickerStore } from "./context";
  let {
    endpoint = "start",
    children,
    ...attributes
  }: HTMLSelectAttributes & {
    endpoint?: Endpoint;
    children?: Snippet;
  } = $props();
  const store = usePickerStore();
  let element: HTMLSelectElement;
  $effect(() => {
    attributes.disabled;
    return bindTimeSegment(element, store, "period", endpoint);
  });
</script>

<select
  {...attributes}
  value={attributes.value ??
    timeSegmentValue(
      pointFor(store.getSnapshot().draft, endpoint)?.time,
      "period",
      store.getSnapshot().options.hourCycle,
    )}
  bind:this={element}
  >{#if children}{@render children()}{:else}<option>AM</option><option
      >PM</option
    >{/if}</select
>
