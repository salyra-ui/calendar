export * from "../core";
import {
  bindCalendar,
  bindMonthScroller,
  bindDateField,
  bindTimeSegment,
  bindDayTrigger,
  createPickerStore,
  pointFor,
  type PickerStore,
  type PickerOptions,
  type Endpoint,
  type TimeSegment,
  attribute,
  formatMonth,
  dayAttributes,
} from "../core";
export function mountPicker(
  root: HTMLElement,
  options: PickerOptions | PickerStore = {},
) {
  const provided = "getSnapshot" in options;
  const store = provided ? options : createPickerStore(options);
  const cleanups: (() => void)[] = [];
  const own = (selector: string) =>
    [...root.querySelectorAll<HTMLElement>(selector)].filter(
      (el) =>
        !el.parentElement?.closest("[data-picker-root]") ||
        el.parentElement.closest("[data-picker-root]") === root,
    );
  attribute(root, "data-picker-root", true);
  for (const el of own("[data-continuous]"))
    cleanups.push(
      bindMonthScroller(el, store, JSON.parse(el.dataset.continuous ?? "{}")),
    );
  for (const el of own("[data-calendar]"))
    cleanups.push(
      bindCalendar(el, store, JSON.parse(el.dataset.calendarOptions ?? "{}")),
    );
  for (const el of own("[data-day-trigger]"))
    if (!el.closest("[data-calendar]"))
      cleanups.push(
        bindDayTrigger(el as HTMLButtonElement, store, el.dataset.date!),
      );
  for (const el of own("[data-date-field]"))
    cleanups.push(
      bindDateField(
        el as HTMLInputElement,
        store,
        (el.dataset.endpoint as Endpoint) ?? "start",
      ),
    );
  for (const el of own("[data-time-segment]"))
    cleanups.push(
      bindTimeSegment(
        el as HTMLInputElement,
        store,
        el.dataset.timeSegment as TimeSegment,
        (el.dataset.endpoint as Endpoint) ?? "start",
      ),
    );
  const click = (event: MouseEvent) => {
    if (event.defaultPrevented) return;
    const button = (event.target as Element).closest<HTMLElement>(
      "[data-picker-action]",
    );
    if (
      !button ||
      !root.contains(button) ||
      button.closest("[data-picker-root]") !== root
    )
      return;
    const state = store.getSnapshot();
    if (state.options.disabled) return;
    const action = button.dataset.pickerAction;
    try {
      if (action === "previous") store.navigate(-1);
      else if (action === "next") store.navigate(1);
      else if (action === "open") store.setOpen(true);
      else if (action === "cancel" || action === "apply" || action === "clear")
        store[action]();
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
    }
  };
  const change = (event: Event) => {
    const el = event.target as HTMLInputElement;
    if (
      el.closest("[data-picker-root]") !== root ||
      store.getSnapshot().options.disabled
    )
      return;
    try {
      if (el.hasAttribute("data-month-select"))
        store.setVisibleMonth({
          ...store.getSnapshot().visibleMonth,
          month: Number(el.value),
        });
      if (el.hasAttribute("data-year-select"))
        store.setVisibleMonth({
          ...store.getSnapshot().visibleMonth,
          year: Number(el.value),
        });
      if (el.hasAttribute("data-day-offset"))
        store.setDayOffset(
          Number(el.value),
          (el.dataset.endpoint as Endpoint) ?? "end",
        );
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
    }
  };
  const update = () => {
    const s = store.getSnapshot();
    for (const cell of own("[data-calendar-cell]"))
      for (const [key, value] of Object.entries(
        dayAttributes(
          store,
          cell.dataset.date!,
          cell.hasAttribute("data-outside"),
        ),
      ))
        attribute(cell, key, value);
    for (const el of own("[data-picker-output]"))
      el.textContent = JSON.stringify(s.value, null, 2);
    for (const el of own("[data-picker-error]")) {
      el.textContent = s.error ?? "";
      el.hidden = !s.error;
    }
    for (const el of own("[data-month-heading]"))
      el.textContent = formatMonth(s.visibleMonth, s.options.locale);
    for (const el of own("[data-month-select]"))
      (el as HTMLSelectElement).value = String(s.visibleMonth.month);
    for (const el of own("[data-year-select]"))
      (el as HTMLSelectElement).value = String(s.visibleMonth.year);
    for (const el of own(
      "[data-picker-action], [data-month-select], [data-year-select], [data-day-offset]",
    ))
      (el as HTMLButtonElement).disabled = !!s.options.disabled;
  };
  update();
  cleanups.push(store.subscribe(update));
  root.addEventListener("click", click);
  root.addEventListener("change", change);
  return {
    store,
    destroy() {
      cleanups.forEach((fn) => fn());
      root.removeEventListener("click", click);
      root.removeEventListener("change", change);
      if (!provided) store.destroy();
    },
  };
}
