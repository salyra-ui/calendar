# Salyra UI / Calendar and Pickers

Four separately installable npm packages in one development workspace. The current API version is 0.1.0.

[Salyra UI documentation](https://salyra-ui.github.io/docs/) covers Calendar, Date Picker, Time Picker and Date Time Picker alongside Color Picker and Theme Studio. Its source lives in the separate [documentation repository](https://github.com/salyra-ui/docs).

| Package                     | Purpose                                                | Dependencies                       |
| --------------------------- | ------------------------------------------------------ | ---------------------------------- |
| @salyra-ui/calendar         | Gregorian calendar, shared store and native primitives | None                               |
| @salyra-ui/date-picker      | Dates and date ranges                                  | calendar                           |
| @salyra-ui/time-picker      | Times and multi-day time ranges                        | calendar                           |
| @salyra-ui/date-time-picker | Date and time in one editor                            | calendar, date-picker, time-picker |

Every package has React, Svelte, Vue, Angular, Astro and Vanilla entries. Import only the adapter you use. Framework peers are optional. DateTimePicker composes the other two picker packages and shares the Calendar context. The core is included once in an application's module graph.

## Development

Use Node 22.19 or newer. The verified installation uses Node 24 and npm 11. Run `npm install`, then `npm run check`, `npm test`, `npm run check:frameworks`, `npm run test:ssr` and `npm run build`. The build creates four downloads used by the browser tests. Continue with `npm run verify:package`, `npm run test:browser`, `npm run bench`, `npm run build:site` and `npm run build:astro`.

`npm run dev` serves the examples at http://127.0.0.1:4330 and documentation at /docs.html. `npm run dev:astro` serves Astro examples at http://127.0.0.1:4331.

Each working example has independent Preview and Code tabs. Code shows the actual example module, its setup and styles, with copy and file download controls. Switching tabs preserves the current selection and event draft.

The current toolchain verifies React 18, Svelte 5, Vue 3.5, Angular 20 and Astro 7. See [VALIDATION.md](VALIDATION.md) for coverage and remaining validation.

## Installation

Install the component you need. npm resolves the shared dependencies.

```sh
npm install @salyra-ui/date-picker
```

Use `@salyra-ui/calendar` for custom calendars, `@salyra-ui/time-picker` for time controls or `@salyra-ui/date-time-picker` for both dates and times.

```js
import { DatePicker } from "@salyra-ui/date-picker/react";
import { TimePicker } from "@salyra-ui/time-picker/react";
import { DateTimePicker } from "@salyra-ui/date-time-picker/react";
import { Calendar } from "@salyra-ui/calendar/react";
import "@salyra-ui/date-picker/styles.css";
```

Source workspace packages are private. Publish only the built directories under release, in dependency order: calendar, date-picker and time-picker, then date-time-picker. This prevents publishing raw workspace files.

Default styles are optional and shared. Import one stylesheet when combining packages. Vanilla has readable and minified standalone browser assets, which include their required core. Framework runtime entries are minified. Svelte and Astro use compact compiler inputs. Archives contain dist, README and LICENSE with no sourcemaps.

The build also writes individual Vanilla assets under `public/downloads/<package>/`: `<package>.js`, `<package>.min.js`, `styles.css` and `styles.min.css`. The browser globals are `SalyraCalendar`, `SalyraDatePicker`, `SalyraTimePicker` and `SalyraDateTimePicker`.

## Composition and values

Calendar exposes Root, Grid, Week, Cell, Number, DayTrigger, Heading, Navigation, MonthSelect and YearSelect. DatePicker adds date fields. TimePicker adds time segments. DateTimePicker combines both. Root has no layout wrapper. Event buttons belong beside DayTrigger inside a Cell.

Calendar layout uses integer Gregorian calculations for years 1–9999. Date-only values do not depend on the local time zone. Time ranges use explicit end dates or day offsets. Incomplete or constraint-invalid edits stay in draft. Apply and Cancel can separate draft and committed values.

Use a store per editor or SSR request. Supply matching referenceDate, locale, timeZone and initial values on server and client. Resolve a zoned instant explicitly when elapsed time across DST matters.

Package source lives in `packages/`. Versioned documentation is in `documentation/0.1.0`, with changes in CHANGELOG.md.
