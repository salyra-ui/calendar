import { pickerControlMarkup, mountEndpointPickers } from "./picker-controls";
import {
  createPickerStore,
  type PickerStore,
  type Endpoint,
} from "@salyra-ui/calendar";
import { mountPicker } from "@salyra-ui/calendar/vanilla";
const arrow = (next: boolean) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${next ? "m9 5 7 7-7 7" : "m15 5-7 7 7 7"}"/></svg>`;
const controls = `<div class="calendar-navigation"><button data-picker-action="previous" aria-label="Previous month">${arrow(false)}</button><span data-month-heading aria-live="polite"></span><button data-picker-action="next" aria-label="Next month">${arrow(true)}</button></div>`;
const endpoint = (name: Endpoint, kind: "date" | "time" | "datetime") =>
  `<fieldset class="time-endpoint"><legend>${name === "start" ? "Start" : "End"}</legend>${pickerControlMarkup(name, "date", name === "start" ? "Start date" : "End date")}${kind !== "date" ? pickerControlMarkup(name, "time", name === "start" ? "Start time" : "End time") : ""}</fieldset>`;
export const intervalPickerMarkup = `<div class="example-toolbar"><label>Picker<select id="kind"><option value="date">Date</option><option value="time">Time</option><option value="datetime">Date and time</option></select></label><label>Selection<select id="selection"><option value="range">Range</option><option value="single">Single value</option></select></label><label>Clock<select id="clock"><option value="24">24 hours</option><option value="12">12 hours</option></select></label><label class="check"><input id="seconds" type="checkbox">Seconds</label><label class="check"><input id="disabled" type="checkbox">Disabled</label></div><div class="picker-stage"><div id="picker-host"></div><aside class="output-panel"><h3>Applied value</h3><p>Only configured date and time fields are exported.</p><pre id="applied">null</pre><h3>Draft</h3><pre id="draft">null</pre><p id="picker-error" role="status"></p></aside></div>`;
export function mountIntervalPicker(root: HTMLElement, referenceDate: string) {
  const find = <T extends HTMLElement = HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  let cleanupPicker: (() => void) | undefined, currentStore: PickerStore;
  function mountExample() {
    cleanupPicker?.();
    const kind = (root.querySelector("#kind") as HTMLSelectElement).value as
        "date" | "time" | "datetime",
      selection = (root.querySelector("#selection") as HTMLSelectElement)
        .value as "single" | "range";
    const timeOptions = {
      hourCycle: Number(
        (root.querySelector("#clock") as HTMLSelectElement).value,
      ) as 12 | 24,
      seconds: (root.querySelector("#seconds") as HTMLInputElement).checked,
    };
    const host = root.querySelector<HTMLElement>("#picker-host")!;
    host.innerHTML = `${kind !== "time" ? controls : ""}${kind !== "time" ? '<div class="sp-calendar" data-calendar style="--sp-months:2"></div>' : ""}<div class="endpoint-row">${endpoint("start", kind) + (selection === "range" ? endpoint("end", kind) : "")}</div><div class="picker-actions"><button data-picker-action="clear">Clear</button><button data-picker-action="cancel">Cancel</button><button class="primary" data-picker-action="apply">Apply</button></div>`;
    const store = createPickerStore({
      ...timeOptions,
      kind,
      selection,
      commit: "explicit",
      referenceDate,
      month: { year: 2026, month: 10 },
      months: kind === "time" ? 1 : 2,
      fixedWeeks: true,
      disabled: (root.querySelector("#disabled") as HTMLInputElement).checked,
    });
    const mounted = mountPicker(host, store);
    currentStore = store;
    const endpointControls = mountEndpointPickers(host, currentStore);
    const update = () => {
      const s = mounted.store.getSnapshot();
      root.querySelector("#applied")!.textContent = JSON.stringify(
        s.value,
        null,
        2,
      );
      root.querySelector("#draft")!.textContent = JSON.stringify(
        s.draft,
        null,
        2,
      );
      root.querySelector("#picker-error")!.textContent = s.error ?? "";
    };
    update();
    const stop = mounted.store.subscribe(update);
    cleanupPicker = () => {
      stop();
      endpointControls.destroy();
      mounted.destroy();
      store.destroy();
    };
  }
  const handlers = new AbortController();
  root.addEventListener(
    "change",
    (event) => {
      const id = (event.target as HTMLElement).id;
      if (["clock", "seconds", "kind", "selection"].includes(id))
        mountExample();
      else if (id === "disabled")
        currentStore.setOptions({
          disabled: find<HTMLInputElement>("#disabled").checked,
        });
    },
    { signal: handlers.signal },
  );
  mountExample();
  return () => {
    handlers.abort();
    cleanupPicker?.();
  };
}
