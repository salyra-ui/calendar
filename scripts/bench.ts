import { performance } from "node:perf_hooks";
import {
  createCalendarEngine,
  createPickerStore,
} from "../packages/calendar/src/core";
const e = createCalendarEngine();
let start = performance.now();
for (let year = 1900; year < 2100; year++)
  for (let month = 1; month <= 12; month++)
    e.month(year, month, { fixedWeeks: true });
const cold = performance.now() - start;
start = performance.now();
for (let i = 0; i < 100000; i++) e.month(2010, 3, { fixedWeeks: true });
const warm = performance.now() - start;
const store = createPickerStore({
  selection: "range",
  referenceDate: "2026-10-03",
});
store.selectDate("2026-10-03");
start = performance.now();
for (let i = 0; i < 10000; i++)
  store.hover(`2026-10-${String((i % 25) + 3).padStart(2, "0")}`);
const hover = performance.now() - start;
console.log(
  JSON.stringify(
    {
      cold2400MonthsMs: cold,
      cached100000ReadsMs: warm,
      range10000HoverUpdatesMs: hover,
      retainedMonths: e.cacheSize,
    },
    null,
    2,
  ),
);
if (cold > 2500 || warm > 2500 || hover > 2500 || e.cacheSize > 48)
  throw new Error("Core performance budget exceeded");
