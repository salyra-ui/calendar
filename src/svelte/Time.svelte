<script lang="ts">
  import Segment from "./Segment.svelte";
  import Period from "./Period.svelte";
  import { usePicker } from "./context";
  import type { Endpoint, TimeSegment } from "../core";
  let {
    endpoint = "start",
    labels = {},
    ...attributes
  }: {
    endpoint?: Endpoint;
    labels?: Partial<Record<TimeSegment, string>>;
    [key: string]: unknown;
  } = $props();
  const state = usePicker();
</script>

<div class="sp-time" {...attributes}>
  <label>{labels.hour ?? "Hours"}<Segment part="hour" {endpoint} /></label
  ><label
    >{labels.minute ?? "Minutes"}<Segment part="minute" {endpoint} /></label
  >{#if $state.options.seconds}<label
      >{labels.second ?? "Seconds"}<Segment part="second" {endpoint} /></label
    >{/if}{#if $state.options.hourCycle === 12}<label
      >{labels.period ?? "Period"}<Period {endpoint} /></label
    >{/if}
</div>
