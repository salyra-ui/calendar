<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";
  import { weekdayLabels } from "../core";
  import { usePicker } from "./context";
  let {
    day,
    children,
    ...attributes
  }: HTMLAttributes<HTMLSpanElement> & { day: number; children?: Snippet } =
    $props();
  const state = usePicker();
  const label = $derived(
    weekdayLabels($state.options.locale, $state.options.weekStartsOn).find(
      (d) => d.weekday === day,
    )?.label,
  );
</script>

<span
  {...attributes}
  role="columnheader"
  data-part="weekday"
  data-weekday={day}
  data-weekend={$state.options.weekend.includes(day) ? "" : undefined}
  >{#if children}{@render children()}{:else}{label}{/if}</span
>
