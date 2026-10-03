# Preview validation

Verified locally on 3 October 2026 with Node 24.19.0. The dependency install used npm 11.21.0. This is the 0.1.0 development preview, not a published npm release.

## Checks

| Check                                             | Result                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| Strict TypeScript                                 | Passed                                                                   |
| Unit tests                                        | 23 passed                                                                |
| Chromium browser tests                            | 23 passed                                                                |
| Svelte client and server compilation              | Passed, with no Svelte diagnostics                                       |
| Angular partial compilation                       | Passed                                                                   |
| Astro component compilation and static site build | Passed                                                                   |
| React, Vue, Svelte and Angular server rendering   | Passed for separate initial selections and request isolation             |
| Astro server markup and client interaction        | Passed, including nested independent roots                               |
| Documentation and example site build              | Passed                                                                   |
| Local package archive installation                | Passed in a temporary project                                            |
| Archive contents                                  | 92 files, about 60 KB compressed, no sourcemaps or sourcemap references |
| Adapter isolation                                 | Vanilla import graph contains no other framework adapter                 |

Browser coverage includes date ranges, explicit end dates, same-day date-time ranges, 12-hour input with seconds, disabled controls, historical navigation, keyboard navigation, popup focus, custom event actions, nested roots, mobile overflow and independent documentation tabs. Constraint-invalid segmented edits remain in draft until corrected.

Calendar arithmetic is compared with an independent UTC reference, including Gregorian leap-century rules and year boundaries. Time-zone tests cover missing and repeated wall times in Europe/Bucharest.

## Performance

One local benchmark run measured 66.2 ms for 2,400 uncached months, 75.6 ms for 100,000 cached grid reads and 12.7 ms for 10,000 range-hover updates. These measure the core on this machine, not browser rendering or a performance guarantee.

The store retains at most 48 month grids. Continuous scrolling uses a bounded month window and its own 12-entry cache. The browser test confirms that mounted months remain bounded while scrolling.

## Remaining validation

Keyboard behavior follows the [WAI-ARIA date picker example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/). Manual screen-reader and Safari/Firefox testing remain to be done. GitHub CI is configured but has not run on a remote repository yet.

The development dependency audit reports one [http-cache-semantics advisory](https://github.com/advisories/GHSA-ch52-4w7c-c8xp), affecting that package and Astro. Installed http-cache-semantics 4.2.0 has no patched release available at this check. The generated picker package has no runtime dependencies and does not bundle Astro or this cache dependency. Avoid using the example tooling as a production server until the upstream issue is resolved.

The example site's Angular demonstration includes Angular's development/JIT runtime and triggers Vite's large-chunk warning. That chunk loads only on the Angular demonstration page and is not bundled into another adapter's import.
