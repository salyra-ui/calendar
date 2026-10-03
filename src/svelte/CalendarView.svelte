<script lang="ts">
  import { untrack } from "svelte";
  import {
    calendarMarkup,
    bindCalendar,
    type CalendarRenderOptions,
  } from "../core";
  import { usePickerStore } from "./context";
  let {
    options = {},
    ...attributes
  }: CalendarRenderOptions & {
    options?: CalendarRenderOptions;
    [key: string]: unknown;
  } = $props();
  const store = usePickerStore();
  let element: HTMLDivElement;
  const html = untrack(() => calendarMarkup(store, options));
  $effect(() => bindCalendar(element, store, options));
</script>

<div {...attributes} data-part="calendar" bind:this={element}>{@html html}</div>
