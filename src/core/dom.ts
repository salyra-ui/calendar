import { formatDate, formatMonth, weekdayLabels } from "./format";
import {
  pointFor,
  type PickerStore,
  type Endpoint,
  type DatePoint,
} from "./store";
import { updateTime, timeSegmentValue } from "./time";
import { parseDate, type CalendarDay } from "./calendar";
export function escapeHTML(value: unknown): string {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ]!,
  );
}
export function attribute(
  el: Element,
  name: string,
  value: string | boolean | null | undefined,
) {
  if (value === false || value == null) {
    if (el.hasAttribute(name)) el.removeAttribute(name);
  } else {
    const next = value === true ? "" : value;
    if (el.getAttribute(name) !== next) el.setAttribute(name, next);
  }
}
export interface CalendarRenderOptions {
  renderCell?: (
    day: CalendarDay,
    state: ReturnType<PickerStore["getDay"]>,
  ) => string;
  renderWeekday?: (weekday: number, label: string) => string;
  onDayClick?: (date: string, event: MouseEvent) => void;
  onSelect?: (date: string) => void;
}
export function dayAttributes(
  store: PickerStore,
  date: string,
  outside = false,
) {
  const state = store.getDay(date),
    options = store.getSnapshot().options;
  return {
    "data-date": date,
    "data-selected": state.selected ? "" : undefined,
    "data-range-start": state.rangeStart ? "" : undefined,
    "data-range-end": state.rangeEnd ? "" : undefined,
    "data-in-range": state.inRange ? "" : undefined,
    "data-preview": state.preview && state.inRange ? "" : undefined,
    "data-weekend": state.weekend ? "" : undefined,
    "data-outside": outside ? "" : undefined,
    "data-today": state.today ? "" : undefined,
    "aria-selected":
      state.selected || (state.inRange && !state.preview)
        ? ("true" as const)
        : ("false" as const),
  };
}
export function dayTriggerAttributes(
  store: PickerStore,
  date: string,
  outside = false,
) {
  const { "aria-selected": selected, ...attributes } = dayAttributes(
    store,
    date,
    outside,
  );
  return attributes;
}
export function calendarMarkup(
  store: PickerStore,
  render: CalendarRenderOptions = {},
): string {
  const { options, focusedDate } = store.getSnapshot(),
    labels = weekdayLabels(options.locale, options.weekStartsOn);
  const grids = Array.from({ length: options.months }, (_, offset) =>
    store.getMonth(offset),
  );
  const days = grids
    .flatMap((month) => month.weeks.flat())
    .filter((day) => !day.hidden && !day.outside);
  const tabDate = days.some(
    (day) => day.date === focusedDate && !store.getDay(day.date).disabled,
  )
    ? focusedDate
    : days.find((day) => !store.getDay(day.date).disabled)?.date;
  return Array.from({ length: options.months }, (_, index) => {
    const month = grids[index];
    return `<section class="sp-month" data-part="month"><h3 data-part="month-title" aria-live="polite">${escapeHTML(formatMonth(month, options.locale))}</h3><table role="grid" aria-readonly="${!!options.readOnly}" aria-multiselectable="${options.selection === "range"}" aria-label="${escapeHTML(formatMonth(month, options.locale))}" class="sp-grid"><thead><tr>${labels.map((d) => `<th scope="col" data-part="weekday" data-weekday="${d.weekday}" ${options.weekend.includes(d.weekday) ? "data-weekend" : ""} aria-label="${escapeHTML(weekdayLabels(options.locale, options.weekStartsOn, "long").find((v) => v.weekday === d.weekday)!.label)}">${render.renderWeekday?.(d.weekday, d.label) ?? escapeHTML(d.label)}</th>`).join("")}</tr></thead><tbody>${month.weeks
      .map(
        (week) =>
          `<tr>${week
            .map((day) => {
              if (day.hidden)
                return '<td role="gridcell" aria-disabled="true"></td>';
              const state = store.getDay(day.date),
                disabled =
                  state.disabled ||
                  (day.outside && options.outsideSelectable === false);
              const attrs = Object.entries(
                dayAttributes(store, day.date, day.outside),
              )
                .map(([k, v]) => (v == null ? "" : `${k}="${escapeHTML(v)}"`))
                .join(" ");
              const content =
                render.renderCell?.(day, state) ??
                `<button type="button" data-day-trigger data-date="${day.date}" aria-label="${escapeHTML(formatDate(day.date, options.locale))}" ${disabled ? "disabled" : ""} tabindex="${day.date === tabDate && !day.outside ? "0" : "-1"}"><span data-part="number">${day.day}</span></button>`;
              return `<td role="gridcell" data-part="cell" ${attrs}>${content}</td>`;
            })
            .join("")}</tr>`,
      )
      .join("")}</tbody></table></section>`;
  }).join("");
}
/** Attach to app-owned markup. Month rendering happens only when its grid changes. */
export function bindCalendar(
  root: HTMLElement,
  store: PickerStore,
  render: CalendarRenderOptions = {},
) {
  let gridKey = "";
  const update = () => {
    const { options, visibleMonth, focusedDate } = store.getSnapshot();
    const key = JSON.stringify([
      visibleMonth,
      options.months,
      options.weekStartsOn,
      options.outsideDays,
      options.fixedWeeks,
      options.locale,
      options.weekend,
    ]);
    const hadFocus = root.contains(root.ownerDocument.activeElement);
    if (key !== gridKey) {
      root.innerHTML = calendarMarkup(store, render);
      gridKey = key;
    }
    let focusable: HTMLButtonElement | undefined;
    for (const cell of root.querySelectorAll<HTMLElement>(
      '[data-part="cell"]',
    )) {
      const date = cell.dataset.date!,
        outside = cell.hasAttribute("data-outside"),
        s = store.getDay(date);
      for (const [k, v] of Object.entries(dayAttributes(store, date, outside)))
        attribute(cell, k, v);
      const trigger =
        cell.querySelector<HTMLButtonElement>("[data-day-trigger]");
      if (!trigger) continue;
      trigger.disabled =
        s.disabled || (outside && options.outsideSelectable === false);
      if (!trigger.hasAttribute("aria-label"))
        attribute(trigger, "aria-label", formatDate(date, options.locale));

      attribute(trigger, "aria-current", s.today ? "date" : null);
      trigger.tabIndex = -1;
      if (!trigger.disabled && !outside && (!focusable || date === focusedDate))
        focusable = trigger;
    }
    if (focusable) focusable.tabIndex = 0;
    if (
      hadFocus &&
      focusable &&
      focusedDate === focusable.dataset.date &&
      root.ownerDocument.activeElement !== focusable
    )
      focusable.focus();
    for (const grid of root.querySelectorAll('[role="grid"]')) {
      attribute(grid, "aria-readonly", String(!!options.readOnly));
      attribute(
        grid,
        "aria-multiselectable",
        String(options.selection === "range"),
      );
    }
  };
  const click = (event: MouseEvent) => {
    const trigger = (event.target as Element).closest<HTMLButtonElement>(
      "[data-day-trigger]",
    );
    if (!trigger || !root.contains(trigger) || trigger.disabled) return;
    const date = trigger.dataset.date!;
    render.onDayClick?.(date, event);
    if (event.defaultPrevented) return;
    if (store.selectDate(date)) render.onSelect?.(date);
  };
  const hover = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    const trigger = (event.target as Element).closest<HTMLElement>(
      "[data-day-trigger]",
    );
    if (trigger && !trigger.hasAttribute("disabled"))
      store.hover(trigger.dataset.date!);
  };
  const leave = () => store.hover(null);
  const key = (event: KeyboardEvent) => {
    const trigger = (event.target as Element).closest<HTMLElement>(
      "[data-day-trigger]",
    );
    if (!trigger) return;
    if (event.key === "Escape") {
      store.cancel();
      event.preventDefault();
      return;
    }
    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "Home" ||
      event.key === "End" ||
      event.key === "PageUp" ||
      event.key === "PageDown"
    ) {
      event.preventDefault();
      store.focus(trigger.dataset.date!);
      const rtl = getComputedStyle(root).direction === "rtl";
      const key =
        rtl && event.key === "ArrowLeft"
          ? "ArrowRight"
          : rtl && event.key === "ArrowRight"
            ? "ArrowLeft"
            : event.key;
      try {
        store.moveFocus(key, event.shiftKey);
      } catch (error) {
        if (!(error instanceof RangeError)) throw error;
      }
    }
  };
  update();
  const stop = store.subscribe(update);
  root.addEventListener("click", click);
  root.addEventListener("pointerover", hover);
  root.addEventListener("pointerleave", leave);
  root.addEventListener("keydown", key);
  return () => {
    stop();
    root.removeEventListener("click", click);
    root.removeEventListener("pointerover", hover);
    root.removeEventListener("pointerleave", leave);
    root.removeEventListener("keydown", key);
  };
}
export function bindDateField(
  input: HTMLInputElement,
  store: PickerStore,
  endpoint: Endpoint = "start",
) {
  const original = input.value,
    ownDisabled = input.disabled,
    ownReadonly = input.readOnly;
  const update = () => {
    const s = store.getSnapshot();
    input.disabled = ownDisabled || !!s.options.disabled;
    input.readOnly = ownReadonly || !!s.options.readOnly;
    if (input.ownerDocument.activeElement !== input) {
      input.value = pointFor(s.draft, endpoint)?.date ?? "";
      attribute(input, "aria-invalid", String(!!s.error));
    }
  };
  const change = () => {
    try {
      parseDate(input.value);
      const ok = store.setDate(input.value, endpoint);
      attribute(input, "aria-invalid", String(!ok));
    } catch {
      attribute(input, "aria-invalid", "true");
    }
  };
  const blur = () => {
    input.value = pointFor(store.getSnapshot().draft, endpoint)?.date ?? "";
    attribute(input, "aria-invalid", String(!!store.getSnapshot().error));
  };
  update();
  const stop = store.subscribe(update);
  input.addEventListener("input", change);
  input.addEventListener("blur", blur);
  return () => {
    stop();
    input.removeEventListener("input", change);
    input.removeEventListener("blur", blur);
    input.value = original;
  };
}
export type TimeSegment = "hour" | "minute" | "second" | "period";
export function bindTimeSegment(
  input: HTMLInputElement | HTMLSelectElement,
  store: PickerStore,
  part: TimeSegment,
  endpoint: Endpoint = "start",
) {
  let invalid = false;
  const ownDisabled = input.disabled,
    ownReadonly =
      input instanceof input.ownerDocument.defaultView!.HTMLInputElement &&
      input.readOnly;
  const value = () =>
    timeSegmentValue(
      pointFor(store.getSnapshot().draft, endpoint)?.time,
      part,
      store.getSnapshot().options.hourCycle,
    );
  const update = () => {
    const s = store.getSnapshot();
    input.disabled = ownDisabled || !!s.options.disabled;
    if (input instanceof input.ownerDocument.defaultView!.HTMLInputElement) {
      input.readOnly = ownReadonly || !!s.options.readOnly;
      input.min = part === "hour" && s.options.hourCycle === 12 ? "1" : "0";
      input.max =
        part === "hour" ? (s.options.hourCycle === 12 ? "12" : "23") : "59";
      input.step = part === "minute" ? String(s.options.minuteStep) : "1";
    } else
      input.disabled =
        ownDisabled || !!s.options.disabled || !!s.options.readOnly;
    if (input.ownerDocument.activeElement !== input || !invalid) {
      input.value = value();
      if (!s.error) invalid = false;
    }
    attribute(input, "aria-invalid", String(invalid || !!s.error));
  };
  const edit = () => {
    if (input.value.trim() === "") {
      invalid = true;
      attribute(input, "aria-invalid", "true");
      return;
    }
    try {
      const s = store.getSnapshot(),
        current = pointFor(s.draft, endpoint)?.time ?? "00:00";
      if (part === "minute" && Number(input.value) % s.options.minuteStep !== 0)
        throw new RangeError("Minute must match the configured step");
      const time = updateTime(
        current,
        part,
        input.value,
        s.options.hourCycle,
        !!s.options.seconds || current.length === 8 || part === "second",
      );
      invalid = !store.setTime(time, endpoint);
      attribute(input, "aria-invalid", String(invalid));
    } catch {
      invalid = true;
      attribute(input, "aria-invalid", "true");
    }
  };
  const blur = () => {
    invalid = false;
    input.value = value();
    attribute(input, "aria-invalid", String(!!store.getSnapshot().error));
  };
  update();
  const stop = store.subscribe(update);
  input.addEventListener("input", edit);
  input.addEventListener("blur", blur);
  return () => {
    stop();
    input.removeEventListener("input", edit);
    input.removeEventListener("blur", blur);
  };
}
export function bindPickerForm(
  form: HTMLFormElement,
  store: PickerStore,
  {
    name = "date",
    required = false,
  }: { name?: string; required?: boolean } = {},
) {
  const field = form.ownerDocument.createElement("input");
  field.type = "hidden";
  field.name = name;
  form.append(field);
  const initial = store.getSnapshot().value;
  const update = () => {
    field.disabled = !!store.getSnapshot().options.disabled;
    field.value = JSON.stringify(store.getSnapshot().value);
  };
  const submit = (event: Event) => {
    if (field.disabled) return;
    const v = store.getSnapshot().value,
      empty = !v || ("start" in v && !v.start && !v.end);
    if (empty && !required) return;
    if ((required && empty) || store.validate()) {
      event.preventDefault();
      form.dispatchEvent(
        new CustomEvent("picker-invalid", {
          detail: store.validate() ?? "Choose a value",
        }),
      );
    }
  };
  const reset = () => queueMicrotask(() => store.setValue(initial));
  update();
  const stop = store.subscribe(update);
  form.addEventListener("submit", submit);
  form.addEventListener("reset", reset);
  return () => {
    stop();
    field.remove();
    form.removeEventListener("submit", submit);
    form.removeEventListener("reset", reset);
  };
}
