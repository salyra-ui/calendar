# Changelog

## 0.1.0 · 4 October 2026

First release of Calendar, Date Picker, Time Picker and Date Time Picker. Each package has its own npm installation and framework entries.

- Split Calendar, DatePicker, TimePicker and DateTimePicker into four npm packages with shared dependencies.
- Added package-specific store factories, Vanilla mounts and framework entries.

- Added independent heading names, classes and accessible labels for all seven weekdays.
- Native click handlers can cancel day selection before its default action.
- Updated the event example to create and edit multi-day date-time intervals.
- Replaced bare date/time fields in the interval and event demos with button-triggered DatePicker calendars and TimePicker clock columns. Added downloadable example controls and styles.

- Added independent Preview/Code tabs, copy and file downloads to every working example.
- Added individual standard/minified Vanilla JavaScript and CSS downloads and installation examples.

- Gregorian calendar calculations for years 1–9999, with configurable week starts and outside days.
- Date, time and date-time selection, with single values or ranges.
- Explicit ending dates and day offsets for time ranges across several days.
- Separate draft and applied values, with Apply, Cancel and Clear actions.
- Custom calendar cells, day numbers, weekday labels and independent event buttons.
- Month/year controls, keyboard navigation and an optional popup binding.
- Continuous month scrolling with a bounded DOM window.
- Date/time constraints, unavailable-date callbacks, disabled and readOnly states.
- SSR initial calendar markup and per-request store isolation.
- Explicit time-zone conversion with DST disambiguation.
- React, Svelte, Vue, Angular, Astro and Vanilla adapters.
- Optional CSS and readable/minified Vanilla browser assets, without sourcemaps.
