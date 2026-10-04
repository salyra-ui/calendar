# Calendar and Pickers 0.1.0

API reference for the Calendar, Date Picker, Time Picker and Date Time Picker packages. Install the package you need with npm and import its framework entry.

Calendar, DatePicker, TimePicker and DateTimePicker compose the same store. The core contains no framework dependency. SSR requires an instance per request and matching referenceDate, locale, timeZone and value on the client. Dates use Gregorian years 1–9999.

## Package boundaries

| Package                     | Dependencies                       | Factory                                    |
| --------------------------- | ---------------------------------- | ------------------------------------------ |
| @salyra-ui/calendar         | None                               | createPickerStore(options), including kind |
| @salyra-ui/date-picker      | calendar                           | createDatePickerStore(options)             |
| @salyra-ui/time-picker      | calendar                           | createTimePickerStore(options)             |
| @salyra-ui/date-time-picker | calendar, date-picker, time-picker | createDateTimePickerStore(options)         |

All four have framework entries. Import the matching package, such as `@salyra-ui/time-picker/svelte`. npm installs the declared package dependencies. DateTimePicker uses the DatePicker and TimePicker parts in the same context.

The picker factories and Vanilla mountPicker fix their package's kind. A supplied store must match. Angular's native PickerRoot directive remains generic and requires kind in its options. React, Svelte, Vue and Astro roots choose their package's kind.

## Parts

| Part                     | Behavior                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| Continuous               | A scrollable month window. Only visible months and overscan are mounted.                                  |
| Root                     | Provides a per-instance store without a layout wrapper.                                                   |
| Calendar / View          | Ready-made month grid with optional cell and weekday renderers.                                           |
| Grid / Week / Cell       | App-owned grid, row and day containers for a custom calendar layout.                                      |
| Number                   | Day number presentation. Supply custom text, children and classes.                                        |
| DayTrigger               | Accessible selection button. Event buttons belong beside it inside Cell.                                  |
| Heading / Navigation     | Month caption and previous/next actions. Place them wherever the layout needs them.                       |
| MonthSelect / YearSelect | Separate month and year controls.                                                                         |
| Field                    | Date input with a preserved text draft and validation on edit.                                            |
| Segment / Period         | Hour, minute, second or AM/PM controls.                                                                   |
| Time                     | Ready-made time group in React, Svelte and Vue. Compose Segment and Period in Angular, Astro and Vanilla. |
| Action                   | Apply, Cancel or Clear with your own text and classes.                                                    |

## Root options

| Key                       | Accepted values              | Default                           | Behavior                                                                                                                                 |
| ------------------------- | ---------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| value / defaultValue      | DatePoint / DateRange / null | null                              | Initial selection. value takes precedence, including an explicit null. React accepts a controlled value, Svelte bind:value, Vue v-model. |
| onValueChange             | (value) => void              | Unset                             | Called when the applied value changes. Draft edits and hover do not emit it.                                                             |
| onSelect                  | (date) => void               | Unset                             | Called after an accepted day action, including calendars with selection none.                                                            |
| kind                      | date / time / datetime       | date                              | The fields the picker edits and exports. React, Svelte and Vue namespace roots choose the kind. Angular and Vanilla set it in options.   |
| selection                 | single / range / none        | single                            | none turns the calendar into a navigation surface with optional day actions.                                                             |
| referenceDate             | YYYY-MM-DD                   | Today in the configured time zone | Supply one date on server and client. It seeds initial focus and the today marker.                                                       |
| month                     | {year, month}                | Selected date or referenceDate    | Visible month, independently of the selected value. Months are numbered 1–12.                                                            |
| weekStartsOn              | 0–6                          | 1                                 | Sunday is 0. Reorders headers and aligns the calendar grid.                                                                              |
| outsideDays               | visible / hidden             | visible                           | Show neighbouring-month dates or leave their cells empty.                                                                                |
| outsideSelectable         | boolean                      | true                              | Whether visible neighbouring-month dates can be selected.                                                                                |
| fixedWeeks                | boolean                      | false                             | Keep six rows instead of using the number needed by the month.                                                                           |
| months                    | 1–12                         | 1                                 | Number of consecutive months. Only these grids are rendered.                                                                             |
| locale                    | Intl locale identifier       | en-GB                             | Used for month names, weekday names and accessible date labels.                                                                          |
| weekend                   | Array of weekday numbers     | [0, 6]                            | Exposes data-weekend for app-owned styling and header content.                                                                           |
| commit                    | immediate / explicit         | immediate                         | explicit keeps edits in draft until apply(). cancel() restores the applied value.                                                        |
| hourCycle                 | 12 / 24                      | 24                                | Hour input range and AM/PM presentation.                                                                                                 |
| seconds                   | boolean                      | false                             | Expose seconds in ready-made time controls.                                                                                              |
| minuteStep                | Integer 1–60                 | 1                                 | Validate minute segments against this increment.                                                                                         |
| minDate / maxDate         | YYYY-MM-DD                   | Unset                             | Inclusive selectable date limits.                                                                                                        |
| minTime / maxTime         | HH:mm or HH:mm:ss            | Unset                             | Time-of-day limits, applied at each endpoint.                                                                                            |
| minDuration / maxDuration | Nonnegative number           | Unset                             | Inclusive days for date ranges. Wall-clock seconds for time and datetime ranges.                                                         |
| isDateUnavailable         | (date) => boolean            | Unset                             | Mark a date as unavailable.                                                                                                              |
| isTimeUnavailable         | (time, point) => boolean     | Unset                             | Restrict time slots using the endpoint date and time.                                                                                    |
| isRangeUnavailable        | (start, end) => boolean      | Unset                             | Reject intervals that overlap unavailable periods. The app supplies the overlap rule.                                                    |
| disabled / readOnly       | boolean                      | false                             | disabled blocks controls and selection. readOnly keeps navigation available while preventing edits.                                      |
| timeZone                  | IANA identifier              | UTC                               | Reference-date zone. Use resolveZonedDateTime() to turn an explicit wall date/time into an instant.                                      |

## Values and validation

Date: {date: "YYYY-MM-DD"}. Time: {time: "HH:mm[:ss]"}, optionally with date or dayOffset. DateTime: {date, time}. A range has start and end points. A time interval must either have dates on both endpoints or use day offsets. The clock never implies tomorrow. End must follow start. Date duration constraints count inclusive days. Time/date-time constraints count wall-clock seconds. Resolve zoned instants explicitly for elapsed durations across DST.

Edits can be incomplete in draft. Well-formed field edits that violate constraints stay in draft with an error, allowing the next segment to complete a valid value. setDate, setTime and setDayOffset return false for an invalid draft and do not change the applied value. Calendar day actions reject unavailable dates. Immediate commits emit complete values. Applying an empty draft clears the saved value. Required selection is enforced by the form binding. Explicit commits use apply(), cancel() and clear(). Disabled blocks UI actions, while setValue() remains available for application updates. readOnly allows calendar navigation and blocks value edits. Kind and selection are fixed for a store lifetime. Remount or create another store to change either.

## Part inputs

- Root: React accepts PickerOptions as props. Svelte and Vue accept options, plus store. Svelte binds value, Vue uses v-model. Angular uses [spRoot] and [store]. Astro imports individual .astro components and receives serializable options.
- Calendar.View or Picker.Calendar: ready-made calendar. renderCell(day, state) and renderWeekday(weekday, label) return trusted application markup. onDayClick(date, event) can preventDefault. onSelect(date) runs after accepted selection. React passes these directly, Svelte/Vue/Angular through options. Astro passes matching PickerOptions for server markup. Controls stay disabled until the native bindings mount, so an early click cannot be lost during startup.
- Grid and Week: native grid/row containers. Application CSS controls their layout.
- Cell: date string and outside boolean. Exposes state attributes.
- Number: date string, custom children/snippet/slot. Angular accepts label. Put dots beside Number so changing its label cannot remove them.
- DayTrigger: date and outside. React/Svelte use onSelect, Vue emits select, Angular emits dateSelect. Native click can preventDefault. Event buttons belong beside DayTrigger, never inside it.
- Heading: custom content or current month caption. React/Vue support month offset.
- Weekday: day 0–6. Custom content overrides the localized label. Angular accepts label. Column order follows weekStartsOn.
- Navigation: direction -1 or 1. Angular uses spNavigate.
- Action: action apply, cancel or clear. Own button text and icons.
- Field: endpoint start or end, default start. Native ISO text input.
- Segment: part hour, minute or second. endpoint defaults to start.
- Period: AM/PM select. Angular uses spTimeSegment="period".
- Time: ready-made segmented group in React, Svelte and Vue. Angular, Astro and Vanilla compose native segments. Override group text with labels: {hour, minute, second, period}.
- MonthSelect: custom option content or months 1–12.
- YearSelect: from/to, defaults 1900/2100. Angular uses an app-owned option list.
- Continuous: options from/to months, monthHeight (default 340, at least 280) and overscan (default 1, 0–4). Maximum span 10,000 months. Give its viewport a height and overflow-y:auto. Astro supplies matching Root options as pickerOptions. SSR renders the initial month.

All native primitives accept custom classes, text and native event attributes. React uses className, other adapters use class. Default CSS is optional. Cell states are data-selected, data-range-start, data-range-end, data-in-range, data-preview, data-outside, data-weekend and data-today.

## Weekday presentation and day actions

`CalendarRenderOptions.weekdays` maps actual weekday numbers 0–6 to independent heading options. Sunday is 0. Changing weekStartsOn changes column order without changing these keys.

| Key       | Values           | Behavior                                                                                  |
| --------- | ---------------- | ----------------------------------------------------------------------------------------- |
| label     | string, optional | Heading text. Omitted uses the localized default.                                         |
| class     | string, optional | CSS classes on this heading's th. Uses class in the configuration for every adapter.      |
| ariaLabel | string, optional | Accessible name. Omitted uses a nonempty custom label or the full localized weekday name. |

React passes weekdays directly to Calendar.View. Svelte, Vue and Angular pass it in their calendar rendering options. Astro passes `renderOptions={{weekdays}}` to Calendar, alongside matching Root options. The same serialized names and classes are used during client mounting. Vanilla uses `bindCalendar(element, store, {weekdays})` or the data-calendar-options attribute when mounting existing HTML. Continuous accepts the same weekday presentation map.

For a custom grid, use Calendar.Weekday with native classes and your own children or slots. Saturday and Sunday use the same primitive as all other days.

`selection: 'none'` leaves value untouched while onSelect(date) allows the application to open an editor or another interface. `onDayClick(date, event)` runs before default selection and can call event.preventDefault. Native click handlers can also preventDefault. Pending selection actions are cancelled when their binding is disposed. The package owns no event editor or modal.

The event example stores `{id, title, start: {date, time}, end: {date, time}}` using DateTimePicker in range mode. Each date button opens a DatePicker calendar. Each time button opens TimePicker-backed hour and minute columns. The parent DateTimePicker owns the complete interval. These application-owned controls are implemented in `examples/picker-controls.ts` and `examples/picker-controls.css`, and the documentation offers both files for download. Only an open popup mounts its calendar or clock choices. Closing it preserves the parent draft. Both endpoints must be complete, and the example requires at least one minute. It shows an event on each covered day. An end at midnight excludes that final day. Existing event buttons reopen the full interval for editing. These event records live in the example application and are not a scheduler or persistence API.

## Store methods

- getSnapshot(): immutable options, value, draft, visibleMonth, focusedDate, hoverDate, activeEndpoint, open and error.
- subscribe(callback): all state changes. subscribeValue(callback): applied value changes. Both return cleanup functions.
- getMonth(offset=0): cached immutable grid. getDay(date): selected, rangeStart, rangeEnd, inRange, preview, disabled, today, weekend and focused.
- setVisibleMonth(month), navigate(offset): change visible month independently of selection.
- focus(date), moveFocus(key, shift=false): navigate focus. Keys are arrows, Home, End, PageUp and PageDown. Shift with page keys moves one year.
- hover(date|null): range hover preview.
- selectDate(date): accepted day action, returns boolean.
- setDate(date, endpoint='start'), setTime(time, endpoint='start'): edit one point.
- setDayOffset(days, endpoint='end'): explicit unanchored ending day.
- setEndpoint('start'|'end'): choose time-only date action endpoint. End requires a range.
- setValue(value): update applied value and draft programmatically. Invalid constraints throw.
- apply(): validate complete draft and commit. Returns boolean. cancel(): restore applied value. clear(): clear the draft, or both values in immediate mode.
- setOpen(boolean): popup state. Disabled prevents opening.
- setOptions(patch): change grid options, constraints, formatting and UI state.
- validate(): null or current draft error.
- destroy(): remove subscriptions and clear the month cache. cacheSize reports retained months, bounded at 48.

## Calendar utilities

- parseDate(string), dateString({year,month,day}): validate or format an ISO civil date.
- leapYear(year), daysInMonth(year,month): Gregorian rules.
- dayNumber(date), fromDayNumber(number): integer-day conversion.
- addDays(date,number), addMonths(month,number), shiftDateMonths(date,number): calendar arithmetic.
- weekday(date): Sunday=0. weekNumber(date): ISO week and week year.
- createCalendarEngine(capacity=48): bounded immutable grid cache, month(year,month,options), clear(), cacheSize.
- dateFormatter(locale, options): cached Gregorian UTC Intl formatter. utcDate(date): UTC Date for an ISO civil date.
- validateWeekStart(number): validate a weekday 0–6.
- formatDate(date,locale), formatMonth(month,locale), weekdayLabels(locale,weekStartsOn,width): localized labels. today(zone,now): civil reference date.
- timeSeconds(time), timeString(seconds,includeSeconds), timeParts(time,hourCycle), updateTime(time,part,value,hourCycle,seconds): time conversion and editing.
- timeSlots(step,min,max): bounded time option list. timeSegmentValue(time,part,hourCycle): a display value that stays empty until a time has been chosen.
- resolveZonedDateTime(point,zone,policy='reject'): explicit Date instant. Policy earlier/later resolves repeated or missing DST times.

## Native bindings

dayAttributes(store,date,outside) supplies cell selection states. dayTriggerAttributes supplies corresponding data states without grid-cell-only ARIA on a native button.

calendarMarkup(store, renderOptions) returns escaped default SSR markup. Custom renderers return trusted markup. bindCalendar(element,store,renderOptions), bindDayTrigger(button,store,date,options), bindDateField(input,store,endpoint), bindTimeSegment(inputOrSelect,store,part,endpoint), bindMonthScroller(element,store,options) return cleanup functions. mountPicker(element,optionsOrStore) binds data attributes inside one root and returns {store,destroy}. Declare data-picker-root on nested editors before mounting a parent. The closest root owns each native control. Astro adds these boundaries in server markup.

bindPickerPopover(trigger,content,store,{modal,label}) handles Escape, outside clicks, initial focus and return focus. modal enables a Tab trap. Popup placement and CSS belong to the app. bindPickerForm(form,store,{name,required}) adds a JSON hidden input and handles native reset and invalid submission.

## Framework examples

### React

```
import { DateTimePicker as Picker } from '@salyra-ui/date-time-picker/react';
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
}
```

### Svelte

```
<script lang="ts">
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
</Picker.Root>
```

### Vue

```
<script setup lang="ts">
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
</template>
```

### Angular

```
import { Component } from '@angular/core';
import { PickerRoot, CalendarView, DateField, TimeSegmentField,
  createPickerStore } from '@salyra-ui/date-time-picker/angular';

@Component({ selector: 'app-date-editor', standalone: true,
  imports: [PickerRoot, CalendarView, DateField, TimeSegmentField],
  template: `<div [spRoot]="options" [store]="store">
    <div spCalendar class="sp-calendar"></div>
    <label>Start date <input spDateField="start"></label>
    <label>Start hours <input type="number" spTimeSegment="hour"></label>
    <label>Start minutes <input type="number" spTimeSegment="minute"></label>
    <label>End date <input spDateField="end"></label>
    <label>End hours <input type="number" spTimeSegment="hour" endpoint="end"></label>
    <label>End minutes <input type="number" spTimeSegment="minute" endpoint="end"></label>
    <button (click)="store.apply()">Save interval</button>
  </div>` })
export class DateEditor {
  readonly options = {kind: 'datetime', selection: 'range', commit: 'explicit',
    referenceDate: '2026-10-03'} as const;
  readonly store = createPickerStore(this.options);
}
// Add @import '@salyra-ui/date-time-picker/styles.css' to your global stylesheet.
```

### Astro

```
---
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
</Root>
```

### Vanilla

```
import { mountPicker } from '@salyra-ui/date-time-picker/vanilla';
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

const picker = mountPicker(document.querySelector('#editor'), {
  kind: 'datetime', selection: 'range', commit: 'explicit',
  referenceDate: '2026-10-03', month: {year: 2026, month: 10},
  onValueChange: value => console.log(value)
});
// Call picker.destroy() when removing the editor.
```
