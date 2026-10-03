import { addMonths, createCalendarEngine, type Month } from "./calendar";
import {
  bindCalendar,
  calendarMarkup,
  type CalendarRenderOptions,
} from "./dom";
import type { PickerStore, PickerSnapshot } from "./store";
export interface MonthScrollerOptions extends CalendarRenderOptions {
  from?: Month;
  to?: Month;
  monthHeight?: number;
  overscan?: number;
}
/** Static first month for SSR. The client replaces it with a bounded scroll window. */
export function monthScrollerMarkup(
  store: PickerStore,
  options: MonthScrollerOptions = {},
) {
  const state = store.getSnapshot(),
    engine = createCalendarEngine(1);
  const first = options.from ?? { year: 1900, month: 1 },
    last = options.to ?? { year: 2100, month: 12 };
  const key = (month: Month) => month.year * 12 + month.month;
  const month =
    key(state.visibleMonth) < key(first)
      ? first
      : key(state.visibleMonth) > key(last)
        ? last
        : state.visibleMonth;
  const view = {
    ...store,
    getSnapshot: () => ({
      ...state,
      visibleMonth: month,
      options: { ...state.options, months: 1, fixedWeeks: true },
    }),
    getMonth: (offset = 0) => {
      const m = addMonths(month, offset);
      return engine.month(m.year, m.month, {
        ...state.options,
        fixedWeeks: true,
      });
    },
  };
  return calendarMarkup(view, options);
}
/** Render a small window of months inside an app-owned scrolling element. */
export function bindMonthScroller(
  root: HTMLElement,
  store: PickerStore,
  options: MonthScrollerOptions = {},
) {
  const from = options.from ?? { year: 1900, month: 1 },
    to = options.to ?? { year: 2100, month: 12 };
  addMonths(from, 0);
  addMonths(to, 0);
  const index = (m: Month) => (m.year - from.year) * 12 + m.month - from.month;
  const count = index(to) + 1,
    height = options.monthHeight ?? 340,
    overscan = options.overscan ?? 1;
  if (
    count < 1 ||
    count > 10000 ||
    height < 280 ||
    !Number.isFinite(height) ||
    !Number.isInteger(overscan) ||
    overscan < 0 ||
    overscan > 4
  )
    throw new RangeError("Invalid scrolling window or month geometry");
  const document = root.ownerDocument,
    container = document.createElement("div");
  container.style.height = `${count * height}px`;
  container.style.position = "relative";
  root.replaceChildren(container);
  const engine = createCalendarEngine(12);
  const entries = new Map<number, { element: HTMLElement; stop: () => void }>();
  let frame = 0,
    syncing = false;
  const view = (month: Month): PickerStore => {
    let previous: PickerSnapshot | undefined, next: PickerSnapshot;
    return {
      ...store,
      getSnapshot() {
        const source = store.getSnapshot();
        if (source !== previous) {
          previous = source;
          next = Object.freeze({
            ...source,
            visibleMonth: month,
            options: Object.freeze({
              ...source.options,
              months: 1,
              fixedWeeks: true,
            }),
          });
        }
        return next;
      },
      getMonth(offset = 0) {
        const m = addMonths(month, offset);
        return engine.month(m.year, m.month, {
          ...store.getSnapshot().options,
          fixedWeeks: true,
        });
      },
    };
  };
  const render = () => {
    const top = Math.max(
        0,
        Math.min(count - 1, Math.floor(root.scrollTop / height)),
      ),
      visible = Math.ceil((root.clientHeight || height) / height),
      first = Math.max(0, top - overscan),
      last = Math.min(count - 1, top + visible + overscan);
    for (const [n, entry] of entries)
      if (n < first || n > last) {
        entry.stop();
        entry.element.remove();
        entries.delete(n);
      }
    for (let n = first; n <= last; n++)
      if (!entries.has(n)) {
        const element = document.createElement("div");
        element.className = "sp-scroll-month";
        element.style.cssText = `position:absolute;top:${n * height}px;left:0;right:0;height:${height}px;overflow:hidden`;
        container.append(element);
        const month = addMonths(from, n);
        entries.set(n, {
          element,
          stop: bindCalendar(element, view(month), options),
        });
      }
    if (!syncing) {
      const month = addMonths(from, top),
        s = store.getSnapshot();
      if (
        month.year !== s.visibleMonth.year ||
        month.month !== s.visibleMonth.month
      ) {
        syncing = true;
        store.setVisibleMonth(month);
        syncing = false;
      }
    }
  };
  const onScroll = () => {
    if (!frame)
      frame = root.ownerDocument.defaultView!.requestAnimationFrame(() => {
        frame = 0;
        render();
      });
  };
  const onStore = () => {
    if (syncing) return;
    const n = index(store.getSnapshot().visibleMonth);
    if (n < 0 || n >= count) return;
    if (Math.floor(root.scrollTop / height) !== n) {
      root.scrollTop = n * height;
      render();
    }
  };
  root.scrollTop =
    Math.max(0, Math.min(count - 1, index(store.getSnapshot().visibleMonth))) *
    height;
  render();
  const stop = store.subscribe(onStore);
  root.addEventListener("scroll", onScroll, { passive: true });
  const Observer = root.ownerDocument.defaultView?.ResizeObserver;
  const observer = Observer ? new Observer(onScroll) : undefined;
  observer?.observe(root);
  return () => {
    observer?.disconnect();
    stop();
    root.removeEventListener("scroll", onScroll);
    if (frame) root.ownerDocument.defaultView!.cancelAnimationFrame(frame);
    for (const entry of entries.values()) entry.stop();
    entries.clear();
    engine.clear();
    container.remove();
  };
}
