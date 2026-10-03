import { pickerControlMarkup, mountEndpointPickers } from "./picker-controls";
import { eventCalendarMarkup, mountEventCalendar } from "./event-calendar";
import "../packages/calendar/src/styles.css";
import "./site.css";
import {
  createPickerStore,
  bindCalendar,
  bindMonthScroller,
  bindPickerPopover,
  pointFor,
  formatMonth,
  type PickerStore,
  type Endpoint,
} from "../packages/calendar/src/core";
import { mountPicker } from "../packages/calendar/src/vanilla";
const app = document.querySelector("#app")!;
const referenceDate = "2026-10-03";
export const nav = `<header class="site-nav"><a class="brand" href="/">salyra<span>/</span>ui</a><nav><a href="/">Examples</a><a href="/docs.html">Documentation</a><a href="https://github.com/salyra-ui">GitHub</a></nav></header>`;
const arrow = (next: boolean) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${next ? "m9 5 7 7-7 7" : "m15 5-7 7 7 7"}"/></svg>`;
const controls = `<div class="calendar-navigation"><button data-picker-action="previous" aria-label="Previous month">${arrow(false)}</button><span data-month-heading aria-live="polite"></span><button data-picker-action="next" aria-label="Next month">${arrow(true)}</button></div>`;
const endpoint = (name: Endpoint, kind: "date" | "time" | "datetime") =>
  `<fieldset class="time-endpoint"><legend>${name === "start" ? "Start" : "End"}</legend>${pickerControlMarkup(name, "date", name === "start" ? "Start date" : "End date")}${kind !== "date" ? pickerControlMarkup(name, "time", name === "start" ? "Start time" : "End time") : ""}</fieldset>`;
app.innerHTML = `${nav}<main><section class="hero"><div><p class="eyebrow">Calendar & date pickers</p><h1>Dates, on<br>your terms.</h1><p class="lead">Pick a day, an hour or a range. Move the controls, add your content and keep the same calendar logic.</p><a class="text-link" href="/docs.html">Explore the API</a></div><div class="hero-note"><span class="large-number">31</span><p>Calendar cells with your own<br>numbers, events and controls.</p></div></section><section class="example-section" id="picker"><div class="section-heading"><h2>Choose an interval</h2><p>Try date, time and date-time selection. Apply commits the draft. Cancel keeps the saved value.</p></div><div class="example-toolbar"><label>Picker<select id="kind"><option value="date">Date</option><option value="time">Time</option><option value="datetime">Date and time</option></select></label><label>Selection<select id="selection"><option value="range">Range</option><option value="single">Single value</option></select></label><label>Clock<select id="clock"><option value="24">24 hours</option><option value="12">12 hours</option></select></label><label class="check"><input id="seconds" type="checkbox">Seconds</label><label class="check"><input id="disabled" type="checkbox">Disabled</label></div><div class="picker-stage"><div id="picker-host"></div><aside class="output-panel"><h3>Applied value</h3><p>Only configured date and time fields are exported.</p><pre id="applied">null</pre><h3>Draft</h3><pre id="draft">null</pre><p id="picker-error" role="status"></p></aside></div></section><section class="example-section" id="historical"><div class="section-heading"><h2>Any month, any year</h2><p>March 2010 starts on a Monday. Change the month, week start or outside days and inspect the actual grid.</p></div><div class="example-toolbar"><label>Month<select id="month">${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${i === 2 ? "selected" : ""}>${new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2010, i, 1)))}</option>`).join("")}</select></label><label>Year<input id="year" type="number" min="1" max="9998" value="2010"></label><label>First weekday<select id="week-start"><option value="1">Monday</option><option value="0">Sunday</option><option value="6">Saturday</option></select></label><label>Outside days<select id="outside"><option value="visible">Show</option><option value="hidden">Hide</option></select></label><label class="check"><input id="fixed" type="checkbox">Six weeks</label></div><div class="history-stage"><div id="history-calendar" class="sp-calendar"></div><aside><h3 id="history-title"></h3><p id="history-selection" role="status">Select a day to inspect it.</p><button id="open-popup">Open as a popup</button><div id="popup" class="calendar-popup" hidden><div id="popup-calendar" class="sp-calendar"></div><button id="close-popup">Close</button></div></aside></div></section><section class="example-section" id="events"><div class="section-heading"><h2>Your calendar, your cells</h2><p>Click a day to create an event. Choose when it starts and ends, then open a saved event from any day it covers.</p></div>${eventCalendarMarkup}</section><section class="example-section"><div class="section-heading"><h2>One core, your stack</h2><p>React, Svelte, Vue, Angular, Astro and Vanilla adapters share the same calculations. The stylesheet is optional.</p></div><div class="framework-list">${["React", "Svelte", "Vue", "Angular", "Astro", "Vanilla"].map((x) => `<a href="/docs.html?framework=${x.toLowerCase()}">${x}</a>`).join("")}</div></section></main><footer>${nav.match(/<a class="brand"[\s\S]*?<\/a>/)![0]}<span>Calendar & date pickers</span></footer>`;
let cleanupPicker: (() => void) | undefined, currentStore: PickerStore;
function mountExample() {
  cleanupPicker?.();
  const kind = (document.querySelector("#kind") as HTMLSelectElement).value as
      "date" | "time" | "datetime",
    selection = (document.querySelector("#selection") as HTMLSelectElement)
      .value as "single" | "range";
  const timeOptions = {
    hourCycle: Number(
      (document.querySelector("#clock") as HTMLSelectElement).value,
    ) as 12 | 24,
    seconds: (document.querySelector("#seconds") as HTMLInputElement).checked,
  };
  const host = document.querySelector<HTMLElement>("#picker-host")!;
  host.innerHTML = `${kind !== "time" ? controls : ""}${kind !== "time" ? '<div class="sp-calendar" data-calendar style="--sp-months:2"></div>' : ""}<div class="endpoint-row">${endpoint("start", kind) + (selection === "range" ? endpoint("end", kind) : "")}</div><div class="picker-actions"><button data-picker-action="clear">Clear</button><button data-picker-action="cancel">Cancel</button><button class="primary" data-picker-action="apply">Apply</button></div>`;
  const mounted = mountPicker(host, {
    ...timeOptions,
    kind,
    selection,
    commit: "explicit",
    referenceDate,
    month: { year: 2026, month: 10 },
    months: kind === "time" ? 1 : 2,
    fixedWeeks: true,
    disabled: (document.querySelector("#disabled") as HTMLInputElement).checked,
  });
  currentStore = mounted.store;
  const endpointControls = mountEndpointPickers(host, currentStore);
  const update = () => {
    const s = mounted.store.getSnapshot();
    document.querySelector("#applied")!.textContent = JSON.stringify(
      s.value,
      null,
      2,
    );
    document.querySelector("#draft")!.textContent = JSON.stringify(
      s.draft,
      null,
      2,
    );
    document.querySelector("#picker-error")!.textContent = s.error ?? "";
  };
  update();
  const stop = mounted.store.subscribe(update);
  cleanupPicker = () => {
    stop();
    endpointControls.destroy();
    mounted.destroy();
  };
}
document.querySelector("#clock")!.addEventListener("change", mountExample);
document.querySelector("#seconds")!.addEventListener("change", mountExample);
document.querySelector("#kind")!.addEventListener("change", mountExample);
document.querySelector("#selection")!.addEventListener("change", mountExample);
document.querySelector("#disabled")!.addEventListener("change", () =>
  currentStore.setOptions({
    disabled: (document.querySelector("#disabled") as HTMLInputElement).checked,
  }),
);
mountExample();
const history = createPickerStore({
  month: { year: 2010, month: 3 },
  referenceDate: "2010-03-01",
});
const historyStop = bindCalendar(
  document.querySelector("#history-calendar")!,
  history,
);
const histUpdate = () => {
  document.querySelector("#history-title")!.textContent = formatMonth(
    history.getSnapshot().visibleMonth,
  );
  document.querySelector("#history-selection")!.textContent =
    pointFor(history.getSnapshot().value)?.date ??
    "Select a day to inspect it.";
};
histUpdate();
const histSub = history.subscribe(histUpdate);
document.querySelector("#month")!.addEventListener("change", () =>
  history.setVisibleMonth({
    year: history.getSnapshot().visibleMonth.year,
    month: Number(
      (document.querySelector("#month") as HTMLSelectElement).value,
    ),
  }),
);
document.querySelector("#year")!.addEventListener("input", () => {
  const input = document.querySelector<HTMLInputElement>("#year")!;
  if (input.value && input.validity.valid)
    history.setVisibleMonth({
      year: input.valueAsNumber,
      month: history.getSnapshot().visibleMonth.month,
    });
});
document.querySelector("#week-start")!.addEventListener("change", () =>
  history.setOptions({
    weekStartsOn: Number(
      (document.querySelector("#week-start") as HTMLSelectElement).value,
    ),
  }),
);
document.querySelector("#outside")!.addEventListener("change", () =>
  history.setOptions({
    outsideDays: (document.querySelector("#outside") as HTMLSelectElement)
      .value as "visible" | "hidden",
  }),
);
document.querySelector("#fixed")!.addEventListener("change", () =>
  history.setOptions({
    fixedWeeks: (document.querySelector("#fixed") as HTMLInputElement).checked,
  }),
);
const popupStop = bindCalendar(
  document.querySelector("#popup-calendar")!,
  history,
);
const stopPopover = bindPickerPopover(
  document.querySelector("#open-popup")!,
  document.querySelector("#popup")!,
  history,
  { label: "Choose a historical date" },
);
document
  .querySelector("#close-popup")!
  .addEventListener("click", () => history.cancel());
const scrollSection = document.createElement("section");
scrollSection.className = "example-section";
scrollSection.innerHTML =
  '<div class="section-heading"><h2>Keep scrolling</h2><p>A small window of months stays mounted while the calendar scrolls. Selection follows the same range store.</p></div><div id="continuous-calendar" class="sp-calendar continuous-calendar" tabindex="0" aria-label="Scrolling calendar"></div><p id="scroll-value"></p>';
document.querySelector("#events")!.after(scrollSection);
const scrollStore = createPickerStore({
    referenceDate,
    selection: "range",
    fixedWeeks: true,
  }),
  scrollStop = bindMonthScroller(
    document.querySelector("#continuous-calendar")!,
    scrollStore,
  );
const scrollSub = scrollStore.subscribeValue(
  (value) =>
    (document.querySelector("#scroll-value")!.textContent =
      JSON.stringify(value)),
);
const stopEvents = mountEventCalendar(
  document.querySelector<HTMLElement>("#events")!,
  referenceDate,
);
window.addEventListener(
  "pagehide",
  () => {
    cleanupPicker?.();
    historyStop();
    histSub();
    popupStop();
    stopPopover();
    stopEvents();
    history.destroy();
    scrollStop();
    scrollSub();
    scrollStore.destroy();
  },
  { once: true },
);
