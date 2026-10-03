<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import {
    bindTimeSegment,
    pointFor,
    timeSegmentValue,
    type Endpoint,
    type TimeSegment,
  } from "../core";
  import { usePickerStore } from "./context";
  let {
    part = "hour",
    endpoint = "start",
    ...attributes
  }: HTMLInputAttributes & {
    part?: Exclude<TimeSegment, "period">;
    endpoint?: Endpoint;
  } = $props();
  const store = usePickerStore();
  let element: HTMLInputElement;
  $effect(() => {
    attributes.disabled;
    attributes.readonly;
    return bindTimeSegment(element, store, part, endpoint);
  });
</script>

<input
  {...attributes}
  value={attributes.value ??
    timeSegmentValue(
      pointFor(store.getSnapshot().draft, endpoint)?.time,
      part,
      store.getSnapshot().options.hourCycle,
    )}
  type="number"
  data-part={part}
  bind:this={element}
/>
