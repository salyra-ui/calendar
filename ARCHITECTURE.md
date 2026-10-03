# Calendar and picker architecture

Four npm packages live in one workspace. Calendar owns the shared engine, contexts and native primitives. DatePicker and TimePicker depend on Calendar and provide their specific roots, fields and default store kinds. DateTimePicker depends on all three and composes their parts. One imported framework uses one shared context and core instance. No picker package copies the engine into its ESM adapter.

Each package has separate framework exports and optional peers. Vanilla standalone browser bundles include their dependencies because a script-tag consumer has no module resolver. The package build emits a separate audited archive and README for each package.

## Core

`calendar.ts` converts Gregorian civil dates to integer day numbers. Calendar layout never depends on a local JavaScript Date or daylight-saving transitions. Months are numbered 1–12, weekdays 0–6 with Sunday at zero. Years 1–9999 are supported, with empty padding outside that range.

Each store owns a 48-entry LRU cache of immutable grids. Layout keys include year, month, first weekday, outside-day mode and fixed-week mode. Hover and selection change state attributes, not the cached grids. Intl formatters use a separate bounded cache.

`store.ts` owns immutable applied value, draft, focus, visible month and validation state. Subscribers receive notifications only when state changes. A value callback receives committed changes, not hover. Kind and selection are fixed for a store lifetime. Other options can change without rebuilding the store.

Dates and wall times are separate data. Date-only exports contain no time keys. A time interval uses dates on both endpoints or day offsets. An earlier ending clock time does not imply tomorrow. Date durations use inclusive days, time/datetime durations use wall-clock seconds. Resolve zoned instants explicitly when elapsed duration across DST matters.

## Native bindings

`dom.ts` binds calendars, text fields, time segments and forms. Calendar layout rebuilds only when grid options change. `day.ts` binds application-owned day triggers. Selection runs after the native click handler, so a consumer can cancel it with preventDefault. Event buttons live beside the day trigger and do not select the day.

`popover.ts` manages opening, closing, Escape, return focus and an optional modal focus trap. Placement and popup layout remain application-owned.

`scroller.ts` mounts only the visible month window and overscan. A local 12-entry cache serves fixed six-row months. Scrolling is coalesced with requestAnimationFrame. Removing a month disposes its subscriptions. The static initial month is available for SSR.

## Adapters

React, Svelte and Vue expose compound namespaces, native attributes and custom children/snippets/slots. React uses useSyncExternalStore. Svelte uses per-tree context and readable state. Vue uses provide/inject and shallow immutable snapshots. Components bind and dispose the shared engine through their own lifecycle.

Angular uses standalone directives on native elements. Each directive has its own source file. Astro renders a seeded calendar and mounts the native bindings in a scoped custom element. Vanilla exposes explicit mount/destroy functions and supports nested roots without sharing their selectors.

## Verification

Core tests compare historical date arithmetic with an independent UTC reference, including leap-century rules and year boundaries. Browser tests cover selection, keyboard focus, event isolation, mobile layout, range drafts and framework integrations. SSR tests create independent requests and check initial markup. The build audits archive paths and rejects sourcemaps.
