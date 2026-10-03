import {
  addDays,
  daysInMonth,
  addMonths,
  createCalendarEngine,
  dayNumber,
  dateString,
  parseDate,
  shiftDateMonths,
  weekday,
  validateWeekStart,
  type Month,
  type CalendarGridOptions,
} from "./calendar";
import { today } from "./format";
import { timeSeconds } from "./time";
export type PickerKind = "date" | "time" | "datetime";
export type Endpoint = "start" | "end";
export interface DatePoint {
  readonly date?: string;
  readonly time?: string;
  readonly dayOffset?: number;
}
export interface DateRange {
  readonly start: DatePoint | null;
  readonly end: DatePoint | null;
}
export type PickerValue = DatePoint | DateRange | null;
export interface PickerOptions extends CalendarGridOptions {
  kind?: PickerKind;
  selection?: "single" | "range" | "none";
  value?: PickerValue;
  defaultValue?: PickerValue;
  month?: Month;
  /** Supply the same reference date on the server and client for deterministic SSR. */
  referenceDate?: string;
  locale?: string;
  timeZone?: string;
  months?: number;
  weekend?: readonly number[];
  outsideSelectable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  commit?: "immediate" | "explicit";
  minDate?: string;
  maxDate?: string;
  minTime?: string;
  maxTime?: string;
  hourCycle?: 12 | 24;
  seconds?: boolean;
  minuteStep?: number;
  minDuration?: number;
  maxDuration?: number;
  /** Duration is inclusive days for date ranges and wall-clock seconds for time/datetime. */
  isDateUnavailable?: (date: string) => boolean;
  isTimeUnavailable?: (time: string, point: DatePoint) => boolean;
  isRangeUnavailable?: (start: DatePoint, end: DatePoint) => boolean;
  onValueChange?: (value: PickerValue) => void;
  onSelect?: (date: string) => void;
}
export interface ResolvedPickerOptions extends PickerOptions {
  readonly kind: PickerKind;
  readonly selection: "single" | "range" | "none";
  readonly referenceDate: string;
  readonly locale: string;
  readonly timeZone: string;
  readonly weekStartsOn: number;
  readonly months: number;
  readonly weekend: readonly number[];
  readonly hourCycle: 12 | 24;
  readonly minuteStep: number;
}
export interface PickerSnapshot {
  readonly options: Readonly<ResolvedPickerOptions>;
  readonly value: PickerValue;
  readonly draft: PickerValue;
  readonly visibleMonth: Readonly<Month>;
  readonly focusedDate: string;
  readonly hoverDate: string | null;
  readonly activeEndpoint: Endpoint;
  readonly open: boolean;
  readonly error: string | null;
}
export function isRange(value: PickerValue): value is DateRange {
  return value !== null && "start" in value;
}
export function pointFor(
  value: PickerValue,
  endpoint: Endpoint = "start",
): DatePoint | null {
  return isRange(value) ? value[endpoint] : endpoint === "start" ? value : null;
}
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
function resolve(options: PickerOptions): Readonly<ResolvedPickerOptions> {
  if (options.kind && !["date", "time", "datetime"].includes(options.kind))
    throw new RangeError("Invalid picker kind");
  if (
    options.selection &&
    !["single", "range", "none"].includes(options.selection)
  )
    throw new RangeError("Invalid selection");
  if (
    options.hourCycle !== undefined &&
    options.hourCycle !== 12 &&
    options.hourCycle !== 24
  )
    throw new RangeError("hourCycle must be 12 or 24");
  const referenceDate =
    options.referenceDate ?? today(options.timeZone ?? "UTC");
  parseDate(referenceDate);
  const months = options.months ?? 1,
    minuteStep = options.minuteStep ?? 1;
  if (!Number.isInteger(months) || months < 1 || months > 12)
    throw new RangeError("months must be 1–12");
  if (!Number.isInteger(minuteStep) || minuteStep < 1 || minuteStep > 60)
    throw new RangeError("minuteStep must be 1–60");
  if (options.minDate) parseDate(options.minDate);
  if (options.maxDate) parseDate(options.maxDate);
  if (options.minDate && options.maxDate && options.minDate > options.maxDate)
    throw new RangeError("minDate must precede maxDate");
  if (options.minTime) timeSeconds(options.minTime);
  if (options.maxTime) timeSeconds(options.maxTime);
  if (
    options.minTime &&
    options.maxTime &&
    timeSeconds(options.minTime) > timeSeconds(options.maxTime)
  )
    throw new RangeError("minTime must precede maxTime");
  for (const limit of [options.minDuration, options.maxDuration])
    if (limit !== undefined && (!Number.isFinite(limit) || limit < 0))
      throw new RangeError("Duration must be nonnegative");
  if (
    options.minDuration !== undefined &&
    options.maxDuration !== undefined &&
    options.minDuration > options.maxDuration
  )
    throw new RangeError("minDuration must not exceed maxDuration");
  const weekend = Object.freeze([...(options.weekend ?? [0, 6])]);
  weekend.forEach(validateWeekStart);
  const timeZone = options.timeZone ?? "UTC";
  new Intl.DateTimeFormat("en", { timeZone });
  return Object.freeze({
    ...options,
    kind: options.kind ?? "date",
    selection: options.selection ?? "single",
    referenceDate,
    locale: options.locale ?? "en-GB",
    timeZone,
    weekStartsOn: validateWeekStart(options.weekStartsOn ?? 1),
    months,
    weekend,
    hourCycle: options.hourCycle ?? 24,
    minuteStep,
  });
}
function freezePoint(
  point: DatePoint | null,
  options: ResolvedPickerOptions,
): DatePoint | null {
  if (!point) return null;
  const p: { date?: string; time?: string; dayOffset?: number } = {};
  if (options.kind !== "time") {
    if (!point.date) throw new RangeError("Date is required");
    parseDate(point.date);
    p.date = point.date;
  } else if (point.date) {
    parseDate(point.date);
    p.date = point.date;
  }
  if (options.kind !== "date") {
    if (point.time) {
      timeSeconds(point.time);
      p.time = point.time;
    }
    if (point.dayOffset !== undefined) {
      if (p.date) throw new RangeError("Use date or dayOffset, not both");
      if (!Number.isInteger(point.dayOffset) || point.dayOffset < 0)
        throw new RangeError("dayOffset must be nonnegative");
      p.dayOffset = point.dayOffset;
    }
  }
  return Object.freeze(p);
}
function normalize(
  value: PickerValue,
  options: ResolvedPickerOptions,
): PickerValue {
  if (!value)
    return options.selection === "range"
      ? Object.freeze({ start: null, end: null })
      : null;
  if (options.selection === "range") {
    if (!isRange(value)) throw new RangeError("A range requires start and end");
    return Object.freeze({
      start: freezePoint(value.start, options),
      end: freezePoint(value.end, options),
    });
  }
  if (isRange(value))
    throw new RangeError("Single selection expects one point");
  return freezePoint(value, options);
}
function position(point: DatePoint): number {
  return (
    (point.date ? dayNumber(point.date) : (point.dayOffset ?? 0)) * 86400 +
    (point.time ? timeSeconds(point.time) : 0)
  );
}
export function createPickerStore(input: PickerOptions = {}) {
  let options = resolve(input);
  const initial = normalize(
    input.value === undefined ? (input.defaultValue ?? null) : input.value,
    options,
  );
  const engine = createCalendarEngine();
  const month =
    input.month ?? parseDate(pointFor(initial)?.date ?? options.referenceDate);
  // Validate visible month and its complete multi-month window once.
  addMonths(month, options.months - 1);
  let snapshot: PickerSnapshot = Object.freeze({
    options,
    value: initial,
    draft: initial,
    visibleMonth: Object.freeze({ year: month.year, month: month.month }),
    focusedDate: pointFor(initial)?.date ?? options.referenceDate,
    hoverDate: null,
    activeEndpoint: "start",
    open: false,
    error: null,
  });
  const listeners = new Set<() => void>(),
    valueListeners = new Set<(v: PickerValue) => void>();
  const update = (patch: Partial<PickerSnapshot>) => {
    const previous = snapshot;
    if (
      Object.entries(patch).every(([k, v]) =>
        k === "options"
          ? previous.options === v
          : eq(previous[k as keyof PickerSnapshot], v),
      )
    )
      return;
    snapshot = Object.freeze({ ...snapshot, ...patch });
    listeners.forEach((fn) => fn());
    if (!eq(previous.value, snapshot.value)) {
      valueListeners.forEach((fn) => fn(snapshot.value));
      options.onValueChange?.(snapshot.value);
    }
  };
  const unavailable = (date: string) =>
    !!(
      (options.minDate && date < options.minDate) ||
      (options.maxDate && date > options.maxDate) ||
      options.isDateUnavailable?.(date)
    );
  function validation(value: PickerValue, complete = false): string | null {
    const points = isRange(value) ? [value.start, value.end] : [value];
    if (points.every((point) => point === null)) return null;
    for (const p of points) {
      if (!p) {
        if (complete) return "Choose a complete value";
        continue;
      }
      if (p.date && unavailable(p.date)) return "This date is unavailable";
      if (options.kind !== "date") {
        if (!p.time) {
          if (complete) return "Choose a time";
          continue;
        }
        const t = timeSeconds(p.time);
        if (
          (options.minTime && t < timeSeconds(options.minTime)) ||
          (options.maxTime && t > timeSeconds(options.maxTime)) ||
          options.isTimeUnavailable?.(p.time, p)
        )
          return "This time is unavailable";
      }
    }
    if (
      isRange(value) &&
      value.start &&
      value.end &&
      (options.kind === "date" || (value.start.time && value.end.time))
    ) {
      if (options.kind === "time" && !!value.start.date !== !!value.end.date)
        return "Both endpoints need dates, or neither";
      const span = position(value.end) - position(value.start);
      if (span < 0) return "The end must follow the start";
      const duration = options.kind === "date" ? span / 86400 + 1 : span;
      if (options.minDuration !== undefined && duration < options.minDuration)
        return "The interval is too short";
      if (options.maxDuration !== undefined && duration > options.maxDuration)
        return "The interval is too long";
      if (options.isRangeUnavailable?.(value.start, value.end))
        return "This interval is unavailable";
    }
    return null;
  }
  function change(
    value: PickerValue,
    endpoint = snapshot.activeEndpoint,
    keepInvalid = false,
  ) {
    const next = normalize(value, options),
      error = validation(next);
    if (error) {
      update(
        keepInvalid
          ? { draft: next, error, activeEndpoint: endpoint }
          : { error },
      );
      return false;
    }
    const complete = validation(next, true) === null;
    update({
      draft: next,
      error: null,
      activeEndpoint: endpoint,
      ...(options.commit !== "explicit" && complete ? { value: next } : {}),
    });
    return true;
  }
  function replacePoint(point: DatePoint, endpoint: Endpoint) {
    return change(
      options.selection === "range"
        ? {
            start: pointFor(snapshot.draft, "start"),
            end: pointFor(snapshot.draft, "end"),
            [endpoint]: point,
          }
        : point,
      endpoint,
      true,
    );
  }
  const store = {
    getSnapshot: () => snapshot,
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    subscribeValue(fn: (v: PickerValue) => void) {
      valueListeners.add(fn);
      return () => {
        valueListeners.delete(fn);
      };
    },
    getMonth(offset = 0) {
      const m = addMonths(snapshot.visibleMonth, offset);
      return engine.month(m.year, m.month, options);
    },
    getDay(date: string) {
      if (!date)
        return {
          selected: false,
          rangeStart: false,
          rangeEnd: false,
          inRange: false,
          preview: false,
          disabled: true,
          today: false,
          weekend: false,
          focused: false,
        };
      const d = snapshot.draft,
        start = pointFor(d)?.date,
        end = isRange(d) ? d.end?.date : undefined;
      const hover = !end && start ? snapshot.hoverDate : null;
      const lo = hover && hover < start! ? hover : start,
        hi = hover && hover < start! ? start : (hover ?? end);
      return {
        selected: date === start || date === end,
        rangeStart: date === start,
        rangeEnd: date === end,
        inRange: !!(lo && hi && date >= lo && date <= hi),
        preview: !!hover,
        disabled: !!options.disabled || unavailable(date),
        today: date === options.referenceDate,
        weekend: options.weekend.includes(weekday(date)),
        focused: date === snapshot.focusedDate,
      };
    },
    setVisibleMonth(next: Month) {
      addMonths(next, options.months - 1);
      update({
        visibleMonth: Object.freeze({ year: next.year, month: next.month }),
        hoverDate: null,
      });
    },
    navigate(count: number) {
      store.setVisibleMonth(addMonths(snapshot.visibleMonth, count));
    },
    focus(date: string) {
      parseDate(date);
      update({ focusedDate: date });
      const d = parseDate(date),
        first = dateString({ ...snapshot.visibleMonth, day: 1 }),
        last = addMonths(snapshot.visibleMonth, options.months - 1);
      if (
        date < first ||
        date > dateString({ ...last, day: daysInMonth(last.year, last.month) })
      ) {
        const lastStart = addMonths(
          { year: 9999, month: 12 },
          -(options.months - 1),
        );
        store.setVisibleMonth(
          d.year > lastStart.year ||
            (d.year === lastStart.year && d.month > lastStart.month)
            ? lastStart
            : d,
        );
      }
    },
    moveFocus(key: string, shift = false) {
      let date = snapshot.focusedDate;
      const offsets: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
      };
      if (key in offsets) date = addDays(date, offsets[key]);
      else if (key === "Home")
        date = addDays(date, -((weekday(date) - options.weekStartsOn + 7) % 7));
      else if (key === "End")
        date = addDays(
          date,
          6 - ((weekday(date) - options.weekStartsOn + 7) % 7),
        );
      else if (key === "PageUp" || key === "PageDown")
        date = shiftDateMonths(
          date,
          (key === "PageUp" ? -1 : 1) * (shift ? 12 : 1),
        );
      else return false;
      store.focus(date);
      return true;
    },
    hover(date: string | null) {
      if (date) parseDate(date);
      if (
        options.selection === "range" &&
        pointFor(snapshot.draft)?.date &&
        !pointFor(snapshot.draft, "end")
      )
        update({ hoverDate: date });
    },
    selectDate(date: string) {
      parseDate(date);
      if (options.disabled || options.readOnly || unavailable(date))
        return false;
      if (options.selection === "none") {
        options.onSelect?.(date);
        return true;
      }
      if (options.kind === "time")
        return store.setDate(date, snapshot.activeEndpoint);
      const previous = pointFor(snapshot.draft, snapshot.activeEndpoint);
      let point: DatePoint = {
        date,
        ...(options.kind === "datetime" && previous?.time
          ? { time: previous.time }
          : {}),
      };
      let next: PickerValue = point,
        active: Endpoint = "start";
      if (options.selection === "range") {
        const start = pointFor(snapshot.draft),
          end = pointFor(snapshot.draft, "end");
        if (!start || end) {
          next = { start: point, end: null };
          active = "end";
        } else {
          next =
            date < start.date!
              ? { start: point, end: start }
              : { start, end: point };
          active = "end";
        }
      }
      const accepted = change(next, active);
      if (accepted) {
        update({ focusedDate: date, hoverDate: null });
        options.onSelect?.(date);
      }
      return accepted;
    },
    setDate(date: string, endpoint: Endpoint = "start") {
      parseDate(date);
      if (options.disabled || options.readOnly) return false;
      const current = pointFor(snapshot.draft, endpoint);
      return replacePoint(
        {
          date,
          ...(options.kind !== "date" && current?.time
            ? { time: current.time }
            : {}),
        },
        endpoint,
      );
    },
    setTime(time: string, endpoint: Endpoint = "start") {
      timeSeconds(time);
      if (options.disabled || options.readOnly || options.kind === "date")
        return false;
      const current = pointFor(snapshot.draft, endpoint);
      return replacePoint(
        {
          ...current,
          time,
          ...(options.kind === "datetime" && !current?.date
            ? { date: options.referenceDate }
            : {}),
        },
        endpoint,
      );
    },
    setDayOffset(offset: number, endpoint: Endpoint = "end") {
      if (!Number.isInteger(offset) || offset < 0)
        throw new RangeError("Day offset must be nonnegative");
      if (options.disabled || options.readOnly || options.kind !== "time")
        return false;
      const current = pointFor(snapshot.draft, endpoint);
      return replacePoint(
        { ...current, date: undefined, dayOffset: offset },
        endpoint,
      );
    },
    setEndpoint(endpoint: Endpoint) {
      if (endpoint === "end" && options.selection !== "range")
        throw new RangeError("End is available only for a range");
      update({ activeEndpoint: endpoint });
    },
    setValue(value: PickerValue) {
      const next = normalize(value, options),
        error = validation(next);
      if (error) throw new RangeError(error);
      update({ value: next, draft: next, error: null, hoverDate: null });
    },
    apply() {
      if (options.disabled || options.readOnly) return false;
      const error = validation(snapshot.draft, true);
      if (error) {
        update({ error });
        return false;
      }
      update({ value: snapshot.draft, error: null, open: false });
      return true;
    },
    cancel() {
      update({
        draft: snapshot.value,
        error: null,
        hoverDate: null,
        open: false,
      });
    },
    clear() {
      if (options.disabled || options.readOnly) return;
      const next = normalize(null, options);
      update({
        draft: next,
        value: options.commit === "explicit" ? snapshot.value : next,
        error: null,
        hoverDate: null,
        activeEndpoint: "start",
      });
    },
    setOpen(open: boolean) {
      if (open && options.disabled) return;
      update({ open });
    },
    setOptions(patch: Partial<PickerOptions>) {
      if (
        Object.entries(patch).every(([key, value]) =>
          Object.is(options[key as keyof PickerOptions], value),
        )
      )
        return;
      if (
        (patch.kind && patch.kind !== options.kind) ||
        (patch.selection && patch.selection !== options.selection)
      )
        throw new RangeError("Create a new store to change kind or selection");
      const next = resolve({ ...options, ...patch });
      addMonths(snapshot.visibleMonth, next.months - 1);
      options = next;
      update({ options: next, error: validation(snapshot.draft) });
    },
    validate: () => validation(snapshot.draft, true),
    destroy() {
      listeners.clear();
      valueListeners.clear();
      engine.clear();
    },
    get cacheSize() {
      return engine.cacheSize;
    },
  };
  const error = validation(initial);
  if (error) throw new RangeError(error);
  return store;
}
export type PickerStore = ReturnType<typeof createPickerStore>;
