import intervalSource from "./interval-picker.ts?raw";
import historicalSource from "./historical-calendar.ts?raw";
import eventSource from "./event-calendar.ts?raw";
import scrollingSource from "./scrolling-calendar.ts?raw";
import controlsSource from "./picker-controls.ts?raw";
import controlsStyles from "./picker-controls.css?raw";
import demoStyles from "./demo-styles.css?raw";
import type { ExampleFile } from "./example-tabs";

function starter(
  module: string,
  markup: string,
  mount: string,
  dated: boolean,
) {
  return `import { ${markup}, ${mount} } from './${module}';
import '@salyra-ui/calendar/styles.css';
import './demo-styles.css';

// Your page contains <div id="example"></div>.
const root = document.querySelector<HTMLElement>('#example')!;
root.classList.add('example-preview');
root.innerHTML = ${markup};
const stop = ${mount}(root${dated ? ", '2026-10-03'" : ""});

window.addEventListener('pagehide', stop, { once: true });`;
}
function files(
  module: string,
  markup: string,
  mount: string,
  source: string,
  dated: boolean,
  controls = false,
): ExampleFile[] {
  return [
    { name: "example.ts", source: starter(module, markup, mount, dated) },
    { name: `${module}.ts`, source },
    { name: "demo-styles.css", source: demoStyles },
    ...(controls
      ? [
          { name: "picker-controls.ts", source: controlsSource },
          { name: "picker-controls.css", source: controlsStyles },
        ]
      : []),
  ];
}
export const exampleFiles: Record<string, readonly ExampleFile[]> = {
  picker: files(
    "interval-picker",
    "intervalPickerMarkup",
    "mountIntervalPicker",
    intervalSource,
    true,
    true,
  ),
  historical: files(
    "historical-calendar",
    "historicalCalendarMarkup",
    "mountHistoricalCalendar",
    historicalSource,
    false,
  ),
  events: files(
    "event-calendar",
    "eventCalendarMarkup",
    "mountEventCalendar",
    eventSource,
    true,
    true,
  ),
  scrolling: files(
    "scrolling-calendar",
    "scrollingCalendarMarkup",
    "mountScrollingCalendar",
    scrollingSource,
    true,
  ),
};
