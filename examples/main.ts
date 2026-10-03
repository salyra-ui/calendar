import "@salyra-ui/calendar/styles.css";
import "./site.css";
import { intervalPickerMarkup, mountIntervalPicker } from "./interval-picker";
import {
  historicalCalendarMarkup,
  mountHistoricalCalendar,
} from "./historical-calendar";
import { eventCalendarMarkup, mountEventCalendar } from "./event-calendar";
import {
  scrollingCalendarMarkup,
  mountScrollingCalendar,
} from "./scrolling-calendar";
import { mountExampleTabs } from "./example-tabs";
import { exampleFiles } from "./example-sources";
const app = document.querySelector("#app")!;
const referenceDate = "2026-10-03";
export const nav = `<header class="site-nav"><a class="brand" href="/">salyra<span>/</span>ui</a><nav><a href="/">Examples</a><a href="/docs.html">Documentation</a><a href="https://github.com/salyra-ui">GitHub</a></nav></header>`;
app.innerHTML = `${nav}<main><section class="hero"><div><p class="eyebrow">Calendar & date pickers</p><h1>Dates, on<br>your terms.</h1><p class="lead">Pick a day, an hour or a range. Move the controls, add your content and keep the same calendar logic.</p><a class="text-link" href="/docs.html">Explore the API</a></div><div class="hero-note"><span class="large-number">31</span><p>Calendar cells with your own<br>numbers, events and controls.</p></div></section><section class="example-section" id="picker"><div class="section-heading"><h2>Choose an interval</h2><p>Try date, time and date-time selection. Apply commits the draft. Cancel keeps the saved value.</p></div>${intervalPickerMarkup}</section><section class="example-section" id="historical"><div class="section-heading"><h2>Any month, any year</h2><p>March 2010 starts on a Monday. Change the month, week start or outside days and inspect the actual grid.</p></div>${historicalCalendarMarkup}</section><section class="example-section" id="events"><div class="section-heading"><h2>Your calendar, your cells</h2><p>Click a day to create an event. Choose when it starts and ends, then open a saved event from any day it covers.</p></div>${eventCalendarMarkup}</section><section class="example-section" id="scrolling"><div class="section-heading"><h2>Keep scrolling</h2><p>A small window of months stays mounted while the calendar scrolls. Selection follows the same range store.</p></div>${scrollingCalendarMarkup}</section><section class="example-section"><div class="section-heading"><h2>One core, your stack</h2><p>React, Svelte, Vue, Angular, Astro and Vanilla adapters share the same calculations. The stylesheet is optional.</p></div><div class="framework-list">${["React", "Svelte", "Vue", "Angular", "Astro", "Vanilla"].map((x) => `<a href="/docs.html?framework=${x.toLowerCase()}">${x}</a>`).join("")}</div></section></main><footer>${nav.match(/<a class="brand"[\s\S]*?<\/a>/)![0]}<span>Calendar & date pickers</span></footer>`;
const exampleRoot = (id: string) =>
  document.querySelector<HTMLElement>(`#${id}`)!;
const tabCleanups = ["picker", "historical", "events", "scrolling"].map((id) =>
  mountExampleTabs(exampleRoot(id), exampleFiles[id]),
);
const cleanups = [
  ...tabCleanups,
  mountIntervalPicker(exampleRoot("picker"), referenceDate),
  mountHistoricalCalendar(exampleRoot("historical")),
  mountEventCalendar(exampleRoot("events"), referenceDate),
  mountScrollingCalendar(exampleRoot("scrolling"), referenceDate),
];
window.addEventListener("pagehide", () => cleanups.forEach((stop) => stop()), {
  once: true,
});
