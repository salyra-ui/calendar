<script lang="ts">
  import Root from "./Root.svelte";
  import type { ComponentProps } from "svelte";
  let {
    options = {},
    value = $bindable(),
    ...props
  }: ComponentProps<typeof Root> = $props();
</script>

<Root {...props} bind:value options={{ ...options, kind: "time" }} />
