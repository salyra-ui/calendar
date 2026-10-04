import pickerControlsSource from "./picker-controls.ts?raw";
import pickerControlsStyles from "./picker-controls.css?raw";
import { escapeHTML } from "@salyra-ui/calendar";
const popupRecipe = [
  "import { mountDateTimePicker } from '@salyra-ui/date-time-picker/vanilla'",
  "import { pickerControlMarkup, mountEndpointPickers } from './picker-controls'",
  "import '@salyra-ui/date-time-picker/styles.css'",
  "",
  "root.innerHTML = [",
  "  pickerControlMarkup('start', 'date', 'Start date'),",
  "  pickerControlMarkup('start', 'time', 'Start time'),",
  "  pickerControlMarkup('end', 'date', 'End date'),",
  "  pickerControlMarkup('end', 'time', 'End time'),",
  `  '<button type="button" data-picker-action="apply">Save interval</button>'`,
  "].join('')",
  "",
  "const picker = mountDateTimePicker(root, {",
  "  selection: 'range', commit: 'explicit', referenceDate: '2026-10-03'",
  "})",
  "const controls = mountEndpointPickers(root, picker.store)",
  "",
  "// When your editor unmounts:",
  "// controls.destroy()",
  "// picker.destroy()",
].join("\n");
import "./site.css";
const frameworks = ["React", "Svelte", "Vue", "Angular", "Astro", "Vanilla"];
const examples: Record<string, string> = {
  React: `import { DateTimePicker as Picker } from '@salyra-ui/date-time-picker/react';
import '@salyra-ui/date-time-picker/styles.css';

export function Editor() {
  return <Picker.Root selection="range" commit="explicit"
    referenceDate="2026-10-03" month={{year: 2026, month: 10}}>
    <Picker.MonthSelect aria-label="Month" />
    <Picker.YearSelect aria-label="Year" from={1900} to={2100} />
    <Picker.Calendar className="sp-calendar" />
    <label>Start date <Picker.Field endpoint="start" /></label>
    <Picker.Time endpoint="start" />
    <label>End date <Picker.Field endpoint="end" /></label>
    <Picker.Time endpoint="end" />
    <Picker.Action action="apply">Save interval</Picker.Action>
    <Picker.Action action="cancel">Cancel</Picker.Action>
  </Picker.Root>;
}`,
  Svelte: `<script lang="ts">
  import { DateTimePicker as Picker } from '@salyra-ui/date-time-picker/svelte';
  import '@salyra-ui/date-time-picker/styles.css';
  const options = { selection: 'range', commit: 'explicit',
    referenceDate: '2026-10-03', month: {year: 2026, month: 10} } as const;
</script>

<Picker.Root {options}>
  <Picker.MonthSelect aria-label="Month" />
  <Picker.YearSelect aria-label="Year" />
  <Picker.Calendar class="sp-calendar" />
  <label>Start date <Picker.Field endpoint="start" /></label>
  <Picker.Time endpoint="start" />
  <label>End date <Picker.Field endpoint="end" /></label>
  <Picker.Time endpoint="end" />
  <Picker.Action action="apply">Save interval</Picker.Action>
  <Picker.Action action="cancel">Cancel</Picker.Action>
</Picker.Root>`,
  Vue: `<script setup lang="ts">
import { DateTimePicker as Picker } from '@salyra-ui/date-time-picker/vue';
import '@salyra-ui/date-time-picker/styles.css';
const options = { selection: 'range', kind: 'datetime', commit: 'explicit',
  referenceDate: '2026-10-03', month: {year: 2026, month: 10} } as const;
</script>
<template>
  <Picker.Root :options="options">
    <Picker.MonthSelect aria-label="Month" />
    <Picker.YearSelect aria-label="Year" />
    <Picker.Calendar class="sp-calendar" />
    <label>Start date <Picker.Field endpoint="start" /></label>
    <Picker.Time endpoint="start" />
    <label>End date <Picker.Field endpoint="end" /></label>
    <Picker.Time endpoint="end" />
    <Picker.Action action="apply">Save interval</Picker.Action>
  </Picker.Root>
</template>`,
  Angular: `import { Component } from '@angular/core';
import { PickerRoot, CalendarView, DateField, TimeSegmentField,
  createPickerStore } from '@salyra-ui/date-time-picker/angular';

@Component({ selector: 'app-date-editor', standalone: true,
  imports: [PickerRoot, CalendarView, DateField, TimeSegmentField],
  template: \`<div [spRoot]="options" [store]="store">
    <div spCalendar class="sp-calendar"></div>
    <label>Start date <input spDateField="start"></label>
    <label>Start hours <input type="number" spTimeSegment="hour"></label>
    <label>Start minutes <input type="number" spTimeSegment="minute"></label>
    <label>End date <input spDateField="end"></label>
    <label>End hours <input type="number" spTimeSegment="hour" endpoint="end"></label>
    <label>End minutes <input type="number" spTimeSegment="minute" endpoint="end"></label>
    <button (click)="store.apply()">Save interval</button>
  </div>\` })
export class DateEditor {
  readonly options = {kind: 'datetime', selection: 'range', commit: 'explicit',
    referenceDate: '2026-10-03'} as const;
  readonly store = createPickerStore(this.options);
}
// Add @import '@salyra-ui/date-time-picker/styles.css' to your global stylesheet.`,
  Astro: `---
import Root from '@salyra-ui/date-time-picker/astro/DateTimePicker.astro';
import Calendar from '@salyra-ui/date-time-picker/astro/Calendar.astro';
import Field from '@salyra-ui/date-time-picker/astro/Field.astro';
import Segment from '@salyra-ui/date-time-picker/astro/Segment.astro';
import Action from '@salyra-ui/date-time-picker/astro/Action.astro';
import '@salyra-ui/date-time-picker/styles.css';
const options = {kind: 'datetime', selection: 'range', commit: 'explicit',
  referenceDate: '2026-10-03', month: {year: 2026, month: 10}} as const;
---
<Root {options}>
  <Calendar {options} class="sp-calendar" />
  <label>Start date <Field endpoint="start" /></label>
  <label>Start hours <Segment part="hour" endpoint="start" /></label>
  <label>Start minutes <Segment part="minute" endpoint="start" /></label>
  <label>End date <Field endpoint="end" /></label>
  <label>End hours <Segment part="hour" endpoint="end" /></label>
  <label>End minutes <Segment part="minute" endpoint="end" /></label>
  <Action action="apply">Save interval</Action>
</Root>`,
  Vanilla: `import { mountPicker } from '@salyra-ui/date-time-picker/vanilla';
import '@salyra-ui/date-time-picker/styles.css';

// Existing markup inside #editor:
// <div data-calendar class="sp-calendar"></div>
// <input data-date-field data-endpoint="start" aria-label="Start date">
// <input data-time-segment="hour" data-endpoint="start" aria-label="Start hours">
// <input data-time-segment="minute" data-endpoint="start" aria-label="Start minutes">
// <input data-date-field data-endpoint="end" aria-label="End date">
// <input data-time-segment="hour" data-endpoint="end" aria-label="End hours">
// <input data-time-segment="minute" data-endpoint="end" aria-label="End minutes">
// <button data-picker-action="apply">Save interval</button>

// Mark nested editors with data-picker-root before mounting a parent.
const picker = mountPicker(document.querySelector('#editor'), {
  selection: 'range', commit: 'explicit',
  referenceDate: '2026-10-03', month: {year: 2026, month: 10},
  onValueChange: value => console.log(value)
});
// Call picker.destroy() when removing the editor.`,
};
const rows = [
  [
    "value / defaultValue",
    "DatePoint | DateRange | null",
    "null",
    "Initial selection. value takes precedence, including an explicit null. React accepts a controlled value, Svelte bind:value, Vue v-model.",
  ],
  [
    "onValueChange",
    "(value) => void",
    "Unset",
    "Called when the applied value changes. Draft edits and hover do not emit it.",
  ],
  [
    "onSelect",
    "(date) => void",
    "Unset",
    "Called after an accepted day action, including calendars with selection none.",
  ],
  [
    "kind",
    "date | time | datetime",
    "date",
    "The fields the picker edits and exports. React, Svelte and Vue namespace roots choose the kind. Angular and Vanilla set it in options.",
  ],
  [
    "selection",
    "single | range | none",
    "single",
    "none turns the calendar into a navigation surface with optional day actions.",
  ],
  [
    "referenceDate",
    "YYYY-MM-DD",
    "Today in the configured time zone",
    "Supply one date on server and client. It seeds initial focus and the today marker.",
  ],
  [
    "month",
    "{year, month}",
    "Selected date or referenceDate",
    "Visible month, independently of the selected value. Months are numbered 1–12.",
  ],
  [
    "weekStartsOn",
    "0–6",
    "1",
    "Sunday is 0. Reorders headers and aligns the calendar grid.",
  ],
  [
    "outsideDays",
    "visible | hidden",
    "visible",
    "Show neighbouring-month dates or leave their cells empty.",
  ],
  [
    "outsideSelectable",
    "boolean",
    "true",
    "Whether visible neighbouring-month dates can be selected.",
  ],
  [
    "fixedWeeks",
    "boolean",
    "false",
    "Keep six rows instead of using the number needed by the month.",
  ],
  [
    "months",
    "1–12",
    "1",
    "Number of consecutive months. Only these grids are rendered.",
  ],
  [
    "locale",
    "Intl locale identifier",
    "en-GB",
    "Used for month names, weekday names and accessible date labels.",
  ],
  [
    "weekend",
    "Array of weekday numbers",
    "[0, 6]",
    "Exposes data-weekend for app-owned styling and header content.",
  ],
  [
    "commit",
    "immediate | explicit",
    "immediate",
    "explicit keeps edits in draft until apply(). cancel() restores the applied value.",
  ],
  ["hourCycle", "12 | 24", "24", "Hour input range and AM/PM presentation."],
  [
    "seconds",
    "boolean",
    "false",
    "Expose seconds in ready-made time controls.",
  ],
  [
    "minuteStep",
    "Integer 1–60",
    "1",
    "Validate minute segments against this increment.",
  ],
  [
    "minDate / maxDate",
    "YYYY-MM-DD",
    "Unset",
    "Inclusive selectable date limits.",
  ],
  [
    "minTime / maxTime",
    "HH:mm or HH:mm:ss",
    "Unset",
    "Time-of-day limits, applied at each endpoint.",
  ],
  [
    "minDuration / maxDuration",
    "Nonnegative number",
    "Unset",
    "Inclusive days for date ranges. Wall-clock seconds for time and datetime ranges.",
  ],
  [
    "isDateUnavailable",
    "(date) => boolean",
    "Unset",
    "Mark a date as unavailable.",
  ],
  [
    "isTimeUnavailable",
    "(time, point) => boolean",
    "Unset",
    "Restrict time slots using the endpoint date and time.",
  ],
  [
    "isRangeUnavailable",
    "(start, end) => boolean",
    "Unset",
    "Reject intervals that overlap unavailable periods. The app supplies the overlap rule.",
  ],
  [
    "disabled / readOnly",
    "boolean",
    "false",
    "disabled blocks controls and selection. readOnly keeps navigation available while preventing edits.",
  ],
  [
    "timeZone",
    "IANA identifier",
    "UTC",
    "Reference-date zone. Use resolveZonedDateTime() to turn an explicit wall date/time into an instant.",
  ],
];
const parts = [
  [
    "Continuous",
    "A scrollable month window. Only visible months and overscan are mounted.",
  ],
  ["Root", "Provides a per-instance store without a layout wrapper."],
  [
    "Calendar / View",
    "Ready-made month grid with optional cell and weekday renderers.",
  ],
  [
    "Grid / Week / Cell",
    "App-owned grid, row and day containers for a custom calendar layout.",
  ],
  [
    "Number",
    "Day number presentation. Supply custom text, children and classes.",
  ],
  [
    "DayTrigger",
    "Accessible selection button. Event buttons belong beside it inside Cell.",
  ],
  [
    "Heading / Navigation",
    "Month caption and previous/next actions. Place them wherever the layout needs them.",
  ],
  ["MonthSelect / YearSelect", "Separate month and year controls."],
  ["Field", "Date input with a preserved text draft and validation on edit."],
  ["Segment / Period", "Hour, minute, second or AM/PM controls."],
  [
    "Time",
    "Ready-made time group in React, Svelte and Vue. Compose Segment and Period in Angular, Astro and Vanilla.",
  ],
  ["Action", "Apply, Cancel or Clear with your own text and classes."],
];
document.querySelector("#app")!.innerHTML =
  `<header class="site-nav"><a class="brand" href="/">salyra<span>/</span>ui</a><nav><a href="/">Examples</a><a href="/docs.html">Documentation</a></nav></header><div class="docs-layout"><aside class="docs-sidebar"><a href="#setup">Setup</a><a href="#vanilla-assets">Vanilla assets</a><a href="#composition">Composition</a><a href="#values">Values & ranges</a><a href="#customization">Customization</a><a href="#recipes">Recipes</a><a href="#parts">Part props</a><a href="#options">Options</a><a href="#methods">Store methods</a><a href="#ssr">SSR & time zones</a></aside><main class="docs-content"><p class="eyebrow"><a href="/changelog.html">v0.1.0 · Changelog</a></p><h1>Calendar &<br>date pickers.</h1><p>Calendar calculations, selection and time controls share one core. Choose a ready-made surface or compose the native controls in your own layout.</p><section id="setup"><h2>Installation</h2><p>Install the component your application needs.</p><pre>npm install @salyra-ui/date-picker</pre><p>For time controls, use <code>@salyra-ui/time-picker</code>. For an editor with dates and times, use <code>@salyra-ui/date-time-picker</code>. Use <code>@salyra-ui/calendar</code> for custom calendar views and day actions.</p><p>npm resolves the declared dependencies. Each package has /react, /svelte, /vue, /angular, /astro and /vanilla entries. Import one adapter. The stylesheet is optional.</p></section><section id="vanilla-assets"><h2>Vanilla without a bundler</h2><p>Download JavaScript and CSS for the package you use. The standard and minified builds have the same API. Each browser script includes its Calendar dependency. The stylesheet is optional when you style the controls yourself.</p><div class="docs-table"><table><thead><tr><th>Package</th><th>JavaScript</th><th>CSS</th><th>Browser global</th></tr></thead><tbody>${[
    "calendar",
    "date-picker",
    "time-picker",
    "date-time-picker",
  ]
    .map(
      (slug) =>
        `<tr><td>${slug}</td><td><a href="/downloads/${slug}/${slug}.js" download>Standard JS</a> · <a href="/downloads/${slug}/${slug}.min.js" download>Minified JS</a></td><td><a href="/downloads/${slug}/styles.css" download>Standard CSS</a> · <a href="/downloads/${slug}/styles.min.css" download>Minified CSS</a></td><td><code>Salyra${slug
          .split("-")
          .map((word) => word[0].toUpperCase() + word.slice(1))
          .join("")}</code></td></tr>`,
    )
    .join(
      "",
    )}</tbody></table></div><div class="recipe"><h3>Downloaded assets, minified</h3><button data-copy-code>Copy code</button><pre><code>&lt;link rel="stylesheet" href="./assets/styles.min.css"&gt;
&lt;div id="date-picker"&gt;
  &lt;div data-calendar class="sp-calendar"&gt;&lt;/div&gt;
&lt;/div&gt;
&lt;script src="./assets/date-picker.min.js"&gt;&lt;/script&gt;
&lt;script&gt;
  const picker = SalyraDatePicker.mountDatePicker(
    document.querySelector('#date-picker'),
    { referenceDate: '2026-10-03', selection: 'range' }
  )
&lt;/script&gt;</code></pre><p>For the readable build, replace date-picker.min.js with date-picker.js and styles.min.css with styles.css. Keep the CSS files beside your downloaded script, or update the paths to match your assets folder.</p></div><div class="recipe"><h3>Package styles</h3><button data-copy-code>Copy code</button><pre><code>// Bundled Vanilla and framework applications:
import '@salyra-ui/date-picker/styles.min.css'

// Readable CSS, when you need it:
import '@salyra-ui/date-picker/styles.standard.css'</code></pre><p>The styles.css entry also resolves to minified CSS in the built package. All four packages share these default styles, so import one when combining them. Import one stylesheet in your application entry or root layout.</p></div></section><section id="composition"><h2>Compose an editor</h2><p>Import DatePicker from date-picker for days, TimePicker from time-picker for hours, or DateTimePicker from date-time-picker for both. Calendar can also navigate and render cells with selection turned off.</p><div class="code-example"><div class="code-toolbar"><div class="framework-tabs" role="tablist">${frameworks.map((f) => `<button role="tab" id="framework-${f.toLowerCase()}" aria-controls="source" data-framework="${f}" aria-selected="false">${f}</button>`).join("")}</div><button id="copy">Copy code</button></div><pre><code id="source" role="tabpanel" tabindex="0"></code></pre><p id="copy-status" role="status"></p></div><table><thead><tr><th>Part</th><th>Use</th></tr></thead><tbody>${parts.map((r) => `<tr><td><code>${r[0]}</code></td><td>${r[1]}</td></tr>`).join("")}</tbody></table><p>React, Svelte and Vue expose compound namespaces. Angular provides native directives. Astro and Vanilla bind existing HTML. <a href="/">Try the working examples.</a></p></section><section id="values"><h2>Values and interval endings</h2><p>A date picker exports {date}. A time picker exports {time}. A range exports {start, end}. Time endpoints can include an explicit date or a dayOffset. The picker never guesses the next day from the clock time.</p><pre>{
  "start": { "date": "2026-10-03", "time": "22:00" },
  "end": { "date": "2026-10-06", "time": "09:30" }
}</pre><p>For an unanchored time interval, {time: "02:00", dayOffset: 3} ends three days after day zero. Give both endpoints dates when you need actual calendar dates. Mixing one dated endpoint with one undated endpoint is rejected.</p><p>Incomplete values remain in draft. A well-formed field edit can also stay in draft while it violates a constraint, so you can finish entering its other segments. The saved value stays valid. Apply validates both endpoints. Clear followed by Apply removes the saved value. Empty values are allowed unless the form binding requires a selection. Hover previews do not change the applied value.</p></section><section id="customization"><h2>Your content and controls</h2><p>Place a custom Number inside DayTrigger. Put event buttons beside the trigger inside Cell, so opening an event does not select the date. Move MonthSelect, YearSelect and Navigation outside the calendar grid.</p><pre>Calendar.Cell
  Calendar.DayTrigger
    Calendar.Number + your dot
  your event buttons</pre><p>Every weekday accepts its own name and class, including Saturday and Sunday. weekStartsOn changes the column order. It does not change the keys in weekdays, where Sunday is 0 and Saturday is 6. The weekend option only marks data-weekend.</p><p>bindCalendar accepts renderCell and renderWeekday for custom Vanilla and ready-made calendar content. These return trusted application markup. Use data-day-trigger and data-date on the day action. Selection states update through cell attributes without rebuilding event content on hover.</p></section><section id="recipes"><h2>Start with the part you need</h2><p>These stores work with every adapter. Pass store to a Root, or to mountPicker in Vanilla. The named createDatePickerStore, createTimePickerStore and createDateTimePickerStore helpers set the kind for you. Calendar, date, time and date-time use composition rather than component inheritance.</p><div class="recipe" id="endpoint-pickers"><h3>Dates and times behind buttons</h3><button data-copy-code>Copy code</button><pre><code>${escapeHTML(popupRecipe)}</code></pre><p>Each date button opens DatePicker. Each time button opens hour and minute columns using TimePicker. The parent DateTimePicker keeps the full interval, so changing the end date leaves the start alone. AM/PM and seconds follow its options.</p><p>These popup controls are part of the example, not extra package exports. Download both files into the same folder. The TypeScript file imports its CSS. Change their markup, classes and labels to match your application.</p><div class="example-downloads"><button type="button" data-control-file="script">Download picker-controls.ts</button><button type="button" data-control-file="style">Download picker-controls.css</button></div><p>Only the open popup mounts its calendar or clock choices. Escape, Close, Done and a click outside close it without cancelling the interval draft. Save interval commits the parent value. <a href="/#events">Try the event editor</a>.</p></div><div class="recipe"><h3>Independent weekday headings</h3><button data-copy-code>Copy code</button><pre><code>const weekdays = {
  1: { label: 'Monday', class: 'workday' },
  6: { label: 'Saturday', class: 'saturday', ariaLabel: 'Saturday' },
  0: { label: 'Sunday', class: 'sunday', ariaLabel: 'Sunday' }
}

// React. Configuration uses class, native props use className.
&lt;Calendar.View weekdays={weekdays} /&gt;
// Svelte: &lt;Calendar.View options={{ weekdays }} /&gt;
// Vue: &lt;Calendar.View :options="{ weekdays }" /&gt;
// Angular: &lt;div [spCalendar]="{ weekdays }"&gt;&lt;/div&gt;
// Astro: &lt;Calendar options={pickerOptions} renderOptions={{ weekdays }} /&gt;
// Vanilla: bindCalendar(element, store, { weekdays })</code></pre><p>label replaces the heading text. class applies to its th element. ariaLabel overrides its accessible name. Omitted days keep their localized names. For an app-owned grid, give each Calendar.Weekday its own children and native class instead.</p></div><div class="recipe"><h3>Your date click decides what opens</h3><button data-copy-code>Copy code</button><pre><code>// Navigation and day actions, without a selected value.
const calendar = createPickerStore({
  selection: 'none', referenceDate: '2026-10-03',
  onSelect: date =&gt; openEventEditor(date)
})
bindCalendar(element, calendar)

// Or cancel default selection in a date picker.
bindCalendar(element, store, {
  onDayClick(date, event) {
    event.preventDefault()
    openEventEditor(date)
  }
})</code></pre><p>The package supplies the date. Your application decides whether to open a drawer, show details or do something else. React and other native click handlers can also preventDefault. Event buttons remain separate from DayTrigger.</p></div><div class="recipe"><h3>Just a date</h3><button data-copy-code>Copy code</button><pre><code>import { createDatePickerStore } from '@salyra-ui/date-picker'

const date = createDatePickerStore({
  selection: 'single',
  referenceDate: '2026-10-03',
  onValueChange: value =&gt; saveDate(value)
})
// date.selectDate('2026-10-09') exports {date: '2026-10-09'}.</code></pre></div><div class="recipe"><h3>A time range with an explicit ending day</h3><button data-copy-code>Copy code</button><pre><code>import { createTimePickerStore } from '@salyra-ui/time-picker'

const time = createTimePickerStore({
  selection: 'range', commit: 'explicit',
  hourCycle: 12, seconds: true, minuteStep: 5,
  defaultValue: {
    start: {time: '22:00:00', dayOffset: 0},
    end: {time: '02:30:00', dayOffset: 3}
  }
})
time.setDayOffset(4, 'end')
time.apply()
// Display a day-offset field, or supply dates on both endpoints.</code></pre></div><div class="recipe"><h3>Scrolling months</h3><button data-copy-code>Copy code</button><pre><code>import { Calendar } from '@salyra-ui/calendar/react'

// Svelte and Vue use the same Continuous options.
&lt;Calendar.Root referenceDate="2026-10-03" selection="range"&gt;
  &lt;Calendar.Continuous className="sp-calendar"
    style={{height: 440, overflowY: 'auto', display: 'block'}}
    options={{from: {year: 2000, month: 1},
      to: {year: 2050, month: 12}, monthHeight: 340, overscan: 1}} /&gt;
&lt;/Calendar.Root&gt;

// Vanilla, or application-owned markup in another adapter:
const stop = bindMonthScroller(element, store, {
  from: {year: 2000, month: 1}, to: {year: 2050, month: 12},
  monthHeight: 340, overscan: 1
})</code></pre><p>Give the viewport an explicit height and overflow-y: auto. monthHeight is the height allocated to one six-row month, at least 280 pixels. overscan accepts 0–4, default 1. The range supports up to 10,000 months. SSR renders the initial month. Astro passes Root options as pickerOptions and scrolling bounds as options.</p></div><div class="recipe"><h3>Popup placement stays in your layout</h3><button data-copy-code>Copy code</button><pre><code>const stop = bindPickerPopover(trigger, content, store, {
  label: 'Choose a date', modal: true
})
// Place your calendar inside content. Style and position it yourself.
// Escape and outside clicks cancel the draft and close the popup.
// modal traps Tab while open. Call stop when unmounting.</code></pre></div><div class="recipe"><h3>A custom marker and an independent event action</h3><button data-copy-code>Copy code</button><pre><code>// React, inside Calendar.Root:
function Month() {
  const grid = useCalendarMonth()
  return &lt;Calendar.Grid aria-label="Schedule"&gt;
    {grid.weeks.map((week, index) =&gt;
      &lt;Calendar.Week key={index}&gt;
        {week.filter(day =&gt; !day.hidden).map(day =&gt;
          &lt;Calendar.Cell key={day.date} date={day.date} outside={day.outside}&gt;
            &lt;Calendar.DayTrigger date={day.date} outside={day.outside}
              className="my-day" onSelect={handleDay}&gt;
              &lt;Calendar.Number date={day.date} className="my-number" /&gt;
              {hasEvents(day.date) &amp;&amp; &lt;span className="my-dot" /&gt;}
            &lt;/Calendar.DayTrigger&gt;
            {hasEvents(day.date) &amp;&amp;
              &lt;button onClick={() =&gt; openEvents(day.date)}&gt;Events&lt;/button&gt;}
          &lt;/Calendar.Cell&gt;)}
      &lt;/Calendar.Week&gt;)}
  &lt;/Calendar.Grid&gt;
}</code></pre><p>Add weekday headers with Calendar.Weekday in a separate row. Each part accepts native attributes and your own content. Classes use className in React and class in the other adapters. Supply your layout CSS for a custom Grid. The optional default CSS styles the ready-made calendar.</p></div><div class="recipe"><h3>Styling a ready-made calendar</h3><button data-copy-code>Copy code</button><pre><code>.my-calendar {
  --sp-accent: #006b56;
  --sp-selected-text: #fff;
  --sp-range: #e4f3ed;
  --sp-day-radius: 50%;
  --sp-border: #c5d7d0;
}
.my-calendar [data-weekend] { color: #ad2451; }
.my-calendar [data-today] [data-part="number"] { font-weight: 700; }
.my-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; }</code></pre><p>For Tailwind, skip the stylesheet and put utilities on your own primitives. Use data-selected, data-in-range and the other cell states in your variants. Labels, text, icons and event contents belong to your application.</p></div></section><section id="parts"><h2>Part props and native bindings</h2><table><thead><tr><th>Part</th><th>Keys / values</th><th>Use</th></tr></thead><tbody>
<tr><td>Root</td><td>store, options, value</td><td>Use an external store or let Root create one. React receives options as props. Svelte and Vue receive an options object. Angular uses [spRoot].</td></tr>
<tr><td>Calendar / View</td><td>weekdays, renderCell, renderWeekday, onDayClick, onSelect</td><td>React receives renderer callbacks directly. Svelte, Vue and Angular use options. Astro uses matching Root options for SSR and mounts native default content. Vanilla passes callbacks to bindCalendar. onDayClick can preventDefault to cancel selection.</td></tr>
<tr><td>Calendar weekday presentation</td><td>weekdays: {0..6: {label?, class?, ariaLabel?}}</td><td>Configure each heading independently. Sunday is 0. Astro passes this map in renderOptions so server and client use the same labels and classes.</td></tr><tr><td>Cell / Number / DayTrigger</td><td>date: YYYY-MM-DD, outside: boolean</td><td>date is required. Cell and DayTrigger accept outside. Number accepts custom children or slots. Angular Number uses label for custom text, with a separate sibling for dots or icons.</td></tr>
<tr><td>DayTrigger callbacks</td><td>onSelect(date), native click</td><td>React/Svelte use onSelect. Vue emits select. Angular emits dateSelect. Native click remains available and can preventDefault. Event actions stay outside the day trigger.</td></tr>
<tr><td>Heading / Weekday</td><td>offset: number / day: 0–6</td><td>Heading offset is supported in React and Vue. Custom children replace its caption. Weekday receives the actual weekday number, not a column index. Angular Weekday accepts label.</td></tr>
<tr><td>Navigation / Action</td><td>direction: -1 | 1 / action: apply | cancel | clear</td><td>Own the button text and icons. Angular uses [spNavigate] and spAction. Vanilla uses data-picker-action, including previous and next.</td></tr>
<tr><td>Field</td><td>endpoint: start | end</td><td>Default start. Expects ISO date text. Native placeholder, class, disabled and readOnly are supported.</td></tr>
<tr><td>Time</td><td>endpoint, labels: {hour, minute, second, period}</td><td>Override the ready-made group labels. To change the input markup itself, compose Segment and Period.</td></tr><tr><td>Segment / Period</td><td>part: hour | minute | second / endpoint: start | end</td><td>Default endpoint start. Period exposes AM and PM for a 12-hour clock. Angular uses spTimeSegment="period" on select.</td></tr>
<tr><td>MonthSelect / YearSelect</td><td>YearSelect: from, to</td><td>Default years 1900–2100 in React, Svelte, Vue and Astro. Supply custom options for your own labels. Angular uses spMonthSelect or spYearSelect on an app-owned select.</td></tr>
<tr><td>Continuous</td><td>options: from, to, monthHeight, overscan</td><td>Use the scrolling recipe above. Bindings clean up when the component unmounts.</td></tr>
</tbody></table><p>Angular directives attach to existing elements, so native children, classes and event bindings stay under Angular's control. Astro components are imported individually from /astro/Component.astro. The JavaScript entry /astro exposes the same core and native bindings as /vanilla.</p></section><section id="options"><h2>Root options</h2><table><thead><tr><th>Key</th><th>Accepted values / default</th><th>Behavior</th></tr></thead><tbody>${rows.map((r) => `<tr><td><code>${r[0]}</code></td><td><code>${r[1]}</code><p>Default: ${r[2]}</p></td><td>${r[3]}</td></tr>`).join("")}</tbody></table></section><section id="methods"><h2>Store methods</h2><table><tbody>${[
    [
      "createPickerStore(options)",
      "Create a store per editor or server request. Each picker package fixes its own kind, while the calendar entry accepts kind explicitly.",
    ],
    [
      "getSnapshot()",
      "Read immutable value, draft, visibleMonth, focusedDate, error and resolved options.",
    ],
    ["getMonth(offset = 0)", "Read a cached immutable month grid."],
    [
      "getDay(date)",
      "Read selected, rangeStart, rangeEnd, inRange, preview, disabled, today, weekend and focused flags.",
    ],
    [
      "focus(date) / moveFocus(key, shift)",
      "Change keyboard focus, navigating months when necessary. moveFocus supports arrows, Home, End, PageUp and PageDown.",
    ],
    ["hover(date | null)", "Set or clear a range hover preview."],
    [
      "setEndpoint(start | end)",
      "Choose the endpoint used by time-only calendar date actions. End requires a range.",
    ],
    [
      "setOpen(boolean)",
      "Control popup state. Opening is blocked when disabled.",
    ],
    ["subscribe(callback)", "Observe state. Returns an unsubscribe function."],
    ["subscribeValue(callback)", "Observe committed values only."],
    [
      "setVisibleMonth({year, month}) / navigate(offset)",
      "Change the visible calendar without changing selection.",
    ],
    [
      "selectDate(date)",
      "Perform the configured day selection. Returns whether it was accepted.",
    ],
    [
      "setDate(date, endpoint) / setTime(time, endpoint)",
      "Edit one endpoint. endpoint is start or end.",
    ],
    [
      "setDayOffset(days, endpoint = end)",
      "Set the ending day of an unanchored time range.",
    ],
    [
      "setOptions(patch)",
      "Update constraints, locale, grid settings, disabled or readonly. Kind and selection stay fixed for the store lifetime.",
    ],
    [
      "setValue(value)",
      "Programmatically replace both applied value and draft. Invalid values throw.",
    ],
    [
      "apply() / cancel() / clear()",
      "Commit a valid draft, restore the applied value or clear selection.",
    ],
    [
      "resolveZonedDateTime(point, zone, policy)",
      "Return a Date instant. Ambiguous and missing local times reject unless earlier or later is chosen.",
    ],
    ["destroy()", "Remove core subscriptions and clear the month cache."],
  ]
    .map((r) => `<tr><td><code>${r[0]}</code></td><td>${r[1]}</td></tr>`)
    .join(
      "",
    )}</tbody></table></section><section id="ssr"><h2>Server rendering and time zones</h2><p>Supply referenceDate, locale, timeZone and the same initial value on server and client. Create stores per request. Calendar dates use civil-day arithmetic, so local DST does not shift a date-only selection.</p><p>Date-time values are wall dates and times. resolveZonedDateTime performs an explicit conversion. Duration constraints in the picker use wall-clock seconds. For billing or elapsed duration across DST, compare the resolved instants and add an isRangeUnavailable rule.</p><p>Astro Calendar receives the same options as its Root for server markup. Astro renders the month first, then activates its controls in the browser. A popup can use bindPickerPopover(trigger, content, store), with optional modal focus handling.</p></section></main></div>`;
function show(framework: string) {
  document
    .querySelector("#source")!
    .setAttribute("aria-labelledby", `framework-${framework.toLowerCase()}`);
  document.querySelector("#source")!.textContent = examples[framework];
  document
    .querySelectorAll<HTMLButtonElement>("[data-framework]")
    .forEach((button) => {
      button.tabIndex = button.dataset.framework === framework ? 0 : -1;
      button.setAttribute(
        "aria-selected",
        String(button.dataset.framework === framework),
      );
    });
}
const requested = new URLSearchParams(location.search).get("framework");
show(frameworks.find((f) => f.toLowerCase() === requested) ?? "React");
document
  .querySelector(".framework-tabs")!
  .addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLElement>(
      "[data-framework]",
    );
    if (button) show(button.dataset.framework!);
  });
document.querySelector("#copy")!.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(
      document.querySelector("#source")!.textContent!,
    );
    document.querySelector("#copy-status")!.textContent = "Code copied.";
  } catch {
    document.querySelector("#copy-status")!.textContent =
      "Select the code and copy it with your keyboard.";
  }
});

document
  .querySelectorAll<HTMLButtonElement>("[data-copy-code]")
  .forEach((button) =>
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(
          button.parentElement!.querySelector("code")!.textContent!,
        );
        button.textContent = "Copied";
        setTimeout(() => (button.textContent = "Copy code"), 1500);
      } catch {
        button.textContent = "Select the code to copy";
      }
    }),
  );
// Keep API tables readable on small screens without widening the page.
for (const table of document.querySelectorAll(".docs-content table")) {
  const wrapper = document.createElement("div");
  wrapper.className = "docs-table";
  table.before(wrapper);
  wrapper.append(table);
}

document
  .querySelector(".framework-tabs")!
  .addEventListener("keydown", (event) => {
    const key = event as KeyboardEvent;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key.key)) return;
    const tabs = [
        ...document.querySelectorAll<HTMLButtonElement>("[data-framework]"),
      ],
      index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      key.key === "Home"
        ? 0
        : key.key === "End"
          ? tabs.length - 1
          : (index + (key.key === "ArrowRight" ? 1 : -1) + tabs.length) %
            tabs.length;
    key.preventDefault();
    show(tabs[next].dataset.framework!);
    tabs[next].focus();
  });

for (const button of document.querySelectorAll<HTMLButtonElement>(
  "[data-control-file]",
)) {
  button.addEventListener("click", () => {
    const script = button.dataset.controlFile === "script";
    const url = URL.createObjectURL(
      new Blob([script ? pickerControlsSource : pickerControlsStyles], {
        type: "text/plain;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = script ? "picker-controls.ts" : "picker-controls.css";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}
