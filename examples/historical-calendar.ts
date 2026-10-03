import {
  createPickerStore,
  bindCalendar,
  bindPickerPopover,
  pointFor,
  formatMonth,
} from "@salyra-ui/calendar";
export const historicalCalendarMarkup = `<div class="example-toolbar"><label>Month<select id="month">${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${i === 2 ? "selected" : ""}>${new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2010, i, 1)))}</option>`).join("")}</select></label><label>Year<input id="year" type="number" min="1" max="9998" value="2010"></label><label>First weekday<select id="week-start"><option value="1">Monday</option><option value="0">Sunday</option><option value="6">Saturday</option></select></label><label>Outside days<select id="outside"><option value="visible">Show</option><option value="hidden">Hide</option></select></label><label class="check"><input id="fixed" type="checkbox">Six weeks</label></div><div class="history-stage"><div id="history-calendar" class="sp-calendar"></div><aside><h3 id="history-title"></h3><p id="history-selection" role="status">Select a day to inspect it.</p><button id="open-popup">Open as a popup</button><div id="popup" class="calendar-popup" hidden><div id="popup-calendar" class="sp-calendar"></div><button id="close-popup">Close</button></div></aside></div>`;
export function mountHistoricalCalendar(root: HTMLElement) {
  const handlers = new AbortController();
  const listen = (selector: string, type: string, fn: (event: Event) => void) =>
    root
      .querySelector(selector)!
      .addEventListener(type, fn, { signal: handlers.signal });
  const history = createPickerStore({
    month: { year: 2010, month: 3 },
    referenceDate: "2010-03-01",
  });
  const historyStop = bindCalendar(
    root.querySelector("#history-calendar")!,
    history,
  );
  const histUpdate = () => {
    root.querySelector("#history-title")!.textContent = formatMonth(
      history.getSnapshot().visibleMonth,
    );
    root.querySelector("#history-selection")!.textContent =
      pointFor(history.getSnapshot().value)?.date ??
      "Select a day to inspect it.";
  };
  histUpdate();
  const histSub = history.subscribe(histUpdate);
  listen("#month", "change", () =>
    history.setVisibleMonth({
      year: history.getSnapshot().visibleMonth.year,
      month: Number((root.querySelector("#month") as HTMLSelectElement).value),
    }),
  );
  listen("#year", "input", () => {
    const input = root.querySelector<HTMLInputElement>("#year")!;
    if (input.value && input.validity.valid)
      history.setVisibleMonth({
        year: input.valueAsNumber,
        month: history.getSnapshot().visibleMonth.month,
      });
  });
  listen("#week-start", "change", () =>
    history.setOptions({
      weekStartsOn: Number(
        (root.querySelector("#week-start") as HTMLSelectElement).value,
      ),
    }),
  );
  listen("#outside", "change", () =>
    history.setOptions({
      outsideDays: (root.querySelector("#outside") as HTMLSelectElement)
        .value as "visible" | "hidden",
    }),
  );
  listen("#fixed", "change", () =>
    history.setOptions({
      fixedWeeks: (root.querySelector("#fixed") as HTMLInputElement).checked,
    }),
  );
  const popupStop = bindCalendar(
    root.querySelector("#popup-calendar")!,
    history,
  );
  const stopPopover = bindPickerPopover(
    root.querySelector("#open-popup")!,
    root.querySelector("#popup")!,
    history,
    { label: "Choose a historical date" },
  );
  root
    .querySelector("#close-popup")!
    .addEventListener("click", () => history.cancel(), {
      signal: handlers.signal,
    });
  return () => {
    handlers.abort();
    historyStop();
    histSub();
    popupStop();
    stopPopover();
    history.destroy();
  };
}
