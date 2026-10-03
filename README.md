# Salyra UI / Date Picker

Composable Gregorian calendars and date, time and date-time selection for React, Svelte, Vue, Angular, Astro and Vanilla. Development preview 0.1.0.

Calendar dates use integer civil-day calculations for years 1–9999. Date-only values do not pass through the user's local time zone. Range selection supports explicit start/end dates and unanchored time ranges with a day offset. Incomplete edits stay in draft. Optional Apply and Cancel separate draft from committed state.

## Development

Use Node 22.19 or newer. Run `npm install`, then `npm run check`, `npm test`, `npm run check:frameworks`, `npm run test:ssr` and `npm run build`. The build creates the download used by the browser tests. Continue with `npm run verify:package`, `npm run test:browser`, `npm run bench`, `npm run build:site` and `npm run build:astro`.

`npm run dev` serves the examples at http://127.0.0.1:4330 and documentation at /docs.html. `npm run dev:astro` serves the Astro examples at http://127.0.0.1:4331.

The current toolchain verifies React 18, Svelte 5, Vue 3.5, Angular 20 and Astro 7. Framework peer dependencies are optional.

See [VALIDATION.md](VALIDATION.md) for test coverage, measured cache behavior and remaining validation.

## Local installation

This package is not published yet. `npm run build` creates `release/package/salyra-ui-date-picker-0.1.0.tgz`. Install that archive in your app. Import only the framework entry you use, such as `@salyra-ui/date-picker/svelte`. Default styles are optional through `@salyra-ui/date-picker/styles.css`.

The generated archive contains dist, README and LICENSE. Vanilla includes readable and minified browser assets. Framework runtime entries are minified. Svelte and Astro include compact compiler inputs. No sourcemaps are generated or packed.

## Composition

Calendar exposes Root, Grid, Week, Cell, Number, DayTrigger, Heading, Navigation, MonthSelect and YearSelect. DatePicker adds date selection and fields. TimePicker provides independent time segments. DateTimePicker combines both. Root has no layout wrapper. Place native event buttons beside DayTrigger inside a Cell.

React uses props and context hooks. Svelte uses options, bind:value and snippets. Vue uses options, v-model and slots. Angular uses standalone directives on existing elements. Astro supplies matching server options and mounts native bindings. Vanilla attaches to existing HTML with explicit cleanup.

Use a store per editor or SSR request. Supply matching referenceDate, locale, timeZone and initial values to server and client. `resolveZonedDateTime` converts a wall date/time to a real instant and requires explicit disambiguation for missing or repeated DST times.

Documentation for this preview is tracked under documentation/0.1.0, with changes in CHANGELOG.md.

See the live local documentation for accepted values, defaults, range semantics, methods and examples.
