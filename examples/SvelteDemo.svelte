<script lang="ts">
  import {
    DatePicker as Picker,
    DateTimePicker,
    Calendar,
    createPickerStore,
    type PickerValue,
  } from "../src/svelte";
  const store = createPickerStore({
    selection: "range",
    referenceDate: "2026-10-03",
    month: { year: 2010, month: 3 },
    commit: "explicit",
  });
  let value: PickerValue = $state(null);
  let datetimeValue: PickerValue | undefined = $state(undefined);
</script>

<main style="padding:40px">
  <h1>Svelte</h1>
  <Picker.Root {store} bind:value
    ><Picker.MonthSelect aria-label="Month" /><Picker.YearSelect
      aria-label="Year"
    /><Picker.Calendar class="sp-calendar" /><Picker.Action action="apply"
      >Apply</Picker.Action
    ><output id="value">{JSON.stringify(value)}</output><Calendar.DayTrigger
      date="2010-03-09"
      ><Calendar.Number date="2010-03-09" /><span class="custom-dot"
      ></span></Calendar.DayTrigger
    ><button
      onclick={() =>
        (document.querySelector("#event-result")!.textContent = "Opened event")}
      >Open event</button
    >
    <p id="event-result"></p></Picker.Root
  >
  <section id="dt-editor">
    <DateTimePicker.Root
      options={{
        referenceDate: "2010-03-09",
        commit: "explicit",
        defaultValue: { date: "2010-03-09", time: "09:30" },
      }}
      bind:value={datetimeValue}
      ><DateTimePicker.Time /><DateTimePicker.Action action="apply"
        >Apply</DateTimePicker.Action
      ><output id="dt-value">{JSON.stringify(datetimeValue)}</output
      ></DateTimePicker.Root
    >
  </section>
</main>
