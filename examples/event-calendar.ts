import {
  createPickerStore,
  bindCalendar,
  escapeHTML,
  weekdayLabels,
  addDays,
  parseDate,
  formatMonth,
  type CalendarRenderOptions,
} from "@salyra-ui/calendar";
import { pickerControlMarkup, mountEndpointPickers } from "./picker-controls";
import { mountDateTimePicker } from "@salyra-ui/date-time-picker/vanilla";

type EventPoint = { date: string; time: string };
type CalendarEvent = {
  id: number;
  title: string;
  start: EventPoint;
  end: EventPoint;
};
const dayNames = weekdayLabels("en-GB", 1, "long");
const navigation = `<div class="calendar-navigation"><button type="button" data-picker-action="previous" aria-label="Previous month"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button><span data-month-heading aria-live="polite"></span><button type="button" data-picker-action="next" aria-label="Next month"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></div>`;
const endpoint = (name: "start" | "end") =>
  `<fieldset class="event-endpoint"><legend>${name === "start" ? "Starts" : "Ends"}</legend>${pickerControlMarkup(name, "date", name === "start" ? "Start date" : "End date")}${pickerControlMarkup(name, "time", name === "start" ? "Start time" : "End time")}</fieldset>`;

export const eventCalendarMarkup = `<div class="event-workspace"><div class="event-calendar-pane"><div id="event-navigation">${navigation}</div><div class="large-calendar-shell"><div class="large-calendar sp-calendar" id="event-calendar"></div></div><p id="event-action" role="status">Choose a date to create an event.</p></div><aside id="event-editor-panel" class="event-editor-panel"><div class="event-editor-heading"><h3 id="event-editor-title">New event</h3><button type="button" id="new-event">New</button></div><form id="event-form"><label>Event title<input name="title" placeholder="Enter a title" maxlength="80" required></label><div id="event-editor" data-picker-root>${endpoint("start")}${endpoint("end")}</div><p id="event-error" role="alert"></p><div class="event-editor-actions"><button class="primary" type="submit" id="save-event">Add event</button><button type="button" id="cancel-event">Cancel</button></div></form><details id="event-export-panel" hidden><summary>Saved event</summary><pre id="event-export"></pre></details></aside></div><details class="weekday-customization"><summary>Weekday names and classes</summary><p>Each heading has its own text and class. The same options work for weekdays and weekends.</p><div class="weekday-editor">${dayNames.map((day) => `<div class="weekday-editor-row"><span>${day.label}</span><label>Name<input data-weekday-label="${day.weekday}" aria-label="${day.label} name" value="${day.label}" maxlength="24"></label><label>Class<input data-weekday-class="${day.weekday}" aria-label="${day.label} class" value="${[0, 6].includes(day.weekday) ? "weekday-red" : ""}" placeholder="Your CSS class"></label></div>`).join("")}</div><p>Try <code>weekday-red</code>, <code>weekday-blue</code> or <code>weekday-bold</code>. Your own stylesheet can define any other class.</p></details>`;

/** Example application behavior. The package emits dates and owns no event editor. */
export function mountEventCalendar(root: HTMLElement, referenceDate: string) {
  const find = <T extends HTMLElement = HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const events = new Map<number, CalendarEvent>();
  let sequence = 0,
    editingId: number | null = null,
    manualError = "";
  const form = find<HTMLFormElement>("#event-form"),
    title = find<HTMLInputElement>('[name="title"]');
  const initialDate = addDays(referenceDate, 6);
  const interval = (date: string) => ({
    start: { date, time: "09:00" },
    end: { date, time: "10:00" },
  });
  const picker = mountDateTimePicker(find("#event-editor"), {
    selection: "range",
    commit: "explicit",
    referenceDate,
    minDuration: 60,
    defaultValue: interval(initialDate),
    month: parseDate(initialDate),
  });
  const editorStore = picker.store;
  const editorControls = mountEndpointPickers(
    find("#event-editor"),
    editorStore,
  );
  const calendarStore = createPickerStore({
    referenceDate,
    selection: "none",
    month: parseDate(referenceDate),
    onSelect: (date) => openEditor(date),
  });
  let stopCalendar: (() => void) | undefined;
  const weekdays: NonNullable<CalendarRenderOptions["weekdays"]> = {};
  for (const day of dayNames)
    weekdays[day.weekday] = {
      label: day.label,
      class: [0, 6].includes(day.weekday) ? "weekday-red" : "",
    };
  const covers = (event: CalendarEvent, date: string) =>
    event.start.date <= date &&
    date <= event.end.date &&
    !(event.end.time === "00:00" && date === event.end.date);
  const clockText = (event: CalendarEvent, date: string) =>
    `${date === event.start.date ? event.start.time : "Continues"}${date === event.end.date ? " to " + event.end.time : ""}`;
  function renderCalendar() {
    stopCalendar?.();
    stopCalendar = bindCalendar(find("#event-calendar"), calendarStore, {
      weekdays,
      renderCell: (day) => {
        const items = [...events.values()].filter((event) =>
          covers(event, day.date),
        );
        return `<button type="button" data-day-trigger data-date="${day.date}" class="event-day-number"><span>${day.day}</span><span class="event-day-action">Add event</span></button>${items.length ? '<span class="event-dot" aria-label="Has events"></span>' : ""}<div class="event-list">${items.map((event) => `<button type="button" data-event-id="${event.id}" class="${event.id === editingId ? "event-editing" : ""}"><span>${escapeHTML(event.title)}</span><small>${escapeHTML(clockText(event, day.date))}</small></button>`).join("")}</div>`;
      },
    });
  }
  function showError() {
    find("#event-error").textContent =
      editorStore.getSnapshot().error ?? manualError;
  }
  function openEditor(date: string, event?: CalendarEvent) {
    editorControls.close();
    calendarStore.focus(date);
    editingId = event?.id ?? null;
    manualError = "";
    find("#event-editor-panel").hidden = false;
    title.value = event?.title ?? "";
    editorStore.setValue(
      event ? { start: event.start, end: event.end } : interval(date),
    );
    editorStore.setVisibleMonth(parseDate(event?.start.date ?? date));
    find("#event-editor-title").textContent = event
      ? "Edit event"
      : "New event";
    find("#save-event").textContent = event ? "Save changes" : "Add event";
    find("#event-action").textContent = event
      ? `Editing event: ${event.title}`
      : `New event on ${date}`;
    showError();
    renderCalendar();
    title.focus({ preventScroll: true });
  }
  const handlers = new AbortController();
  const listen = (
    el: HTMLElement,
    type: string,
    handler: (event: Event) => void,
  ) => el.addEventListener(type, handler, { signal: handlers.signal });
  listen(form, "submit", (event) => {
    event.preventDefault();
    manualError = "";
    if (!title.value.trim()) {
      manualError = "Enter an event title.";
      showError();
      return;
    }
    const invalid = find("#event-editor").querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    if (invalid) {
      manualError = "Check the date and time fields.";
      showError();
      invalid.focus();
      return;
    }
    if (!editorStore.apply()) {
      showError();
      return;
    }
    const value = editorStore.getSnapshot().value;
    if (
      !value ||
      !("start" in value) ||
      !value.start?.date ||
      !value.start.time ||
      !value.end?.date ||
      !value.end.time
    ) {
      manualError = "Choose both dates and times.";
      showError();
      return;
    }
    const wasEditing = editingId !== null;
    const saved: CalendarEvent = {
      id: editingId ?? ++sequence,
      title: title.value.trim(),
      start: { date: value.start.date, time: value.start.time },
      end: { date: value.end.date, time: value.end.time },
    };
    events.set(saved.id, saved);
    editingId = saved.id;
    find("#event-editor-title").textContent = "Edit event";
    find("#save-event").textContent = "Save changes";
    find("#event-action").textContent =
      `${wasEditing ? "Updated" : "Added"} event: ${saved.title}`;
    find("#event-export").textContent = JSON.stringify(saved, null, 2);
    find("#event-export-panel").hidden = false;
    renderCalendar();
  });
  listen(title, "input", () => {
    manualError = "";
    showError();
  });
  listen(find("#new-event"), "click", () =>
    openEditor(calendarStore.getSnapshot().focusedDate),
  );
  listen(find("#cancel-event"), "click", () => {
    editorControls.close();
    editorStore.cancel();
    editingId = null;
    manualError = "";
    find("#event-editor-panel").hidden = true;
    find("#event-action").textContent = "Choose a date to create an event.";
    renderCalendar();
    const button = find("#event-calendar").querySelector<HTMLButtonElement>(
      `[data-day-trigger][data-date="${calendarStore.getSnapshot().focusedDate}"]`,
    );
    button?.focus();
  });
  listen(find("#event-calendar"), "click", (event) => {
    const button = (event.target as Element).closest<HTMLElement>(
      "[data-event-id]",
    );
    if (!button) return;
    const saved = events.get(Number(button.dataset.eventId));
    if (saved) {
      openEditor(saved.start.date, saved);
      find("#event-export").textContent = JSON.stringify(saved, null, 2);
      find("#event-export-panel").hidden = false;
    }
  });
  for (const input of root.querySelectorAll<HTMLInputElement>(
    "[data-weekday-label],[data-weekday-class]",
  ))
    listen(input, "input", () => {
      const day = Number(
          input.dataset.weekdayLabel ?? input.dataset.weekdayClass,
        ),
        key = input.hasAttribute("data-weekday-label") ? "label" : "class";
      weekdays[day] = { ...weekdays[day], [key]: input.value };
      renderCalendar();
    });
  listen(find("#event-navigation"), "click", (event) => {
    const button = (event.target as Element).closest<HTMLElement>(
      "[data-picker-action]",
    );
    if (!button) return;
    calendarStore.navigate(button.dataset.pickerAction === "next" ? 1 : -1);
  });
  const updateHeading = () => {
    const state = calendarStore.getSnapshot(),
      heading = find("#event-navigation [data-month-heading]"),
      label = formatMonth(state.visibleMonth, state.options.locale);
    if (heading.textContent !== label) heading.textContent = label;
  };
  renderCalendar();
  updateHeading();
  const stopHeading = calendarStore.subscribe(updateHeading),
    stopError = editorStore.subscribe(showError);
  return () => {
    handlers.abort();
    stopCalendar?.();
    stopHeading();
    stopError();
    editorControls.destroy();
    picker.destroy();
    calendarStore.destroy();
  };
}
