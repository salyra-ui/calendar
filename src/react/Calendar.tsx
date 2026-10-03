"use client";
import React, {
  forwardRef,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import {
  bindCalendar,
  bindDayTrigger,
  calendarMarkup,
  dayAttributes,
  dayTriggerAttributes,
  formatMonth,
  weekdayLabels,
  type CalendarRenderOptions,
} from "../core";
import { usePickerStore, usePicker } from "./context";
function assign<T>(ref: React.ForwardedRef<T>, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}
export interface CalendarProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, "onSelect">,
    CalendarRenderOptions {}
/** Complete calendar surface. Use Grid/Cell/DayTrigger for app-owned cell content. */
export const CalendarView = forwardRef<HTMLDivElement, CalendarProps>(
  function CalendarView(
    { renderCell, renderWeekday, onDayClick, onSelect, ...props },
    ref,
  ) {
    const store = usePickerStore(),
      node = useRef<HTMLDivElement | null>(null);
    const latest = useRef({ renderCell, renderWeekday, onDayClick, onSelect });
    latest.current = { renderCell, renderWeekday, onDayClick, onSelect };
    useEffect(
      () =>
        bindCalendar(node.current!, store, {
          renderCell: (...args) =>
            latest.current.renderCell?.(...args) ??
            `<button type="button" data-day-trigger data-date="${args[0].date}">${args[0].day}</button>`,
          renderWeekday: (day, label) =>
            latest.current.renderWeekday?.(day, label) ?? label,
          onDayClick: (...args) => latest.current.onDayClick?.(...args),
          onSelect: (date) => latest.current.onSelect?.(date),
        }),
      [store],
    );
    return (
      <div
        {...props}
        data-part="calendar"
        dangerouslySetInnerHTML={{
          __html: calendarMarkup(store, { renderCell, renderWeekday }),
        }}
        ref={(el) => {
          node.current = el;
          assign(ref, el);
        }}
      />
    );
  },
);
export const Grid = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Grid(props, ref) {
    return <div {...props} role="grid" data-part="grid" ref={ref} />;
  },
);
export const Week = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Week(props, ref) {
    return <div {...props} role="row" data-part="week" ref={ref} />;
  },
);
export const Cell = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { date: string; outside?: boolean }
>(function Cell({ date, outside, ...props }, ref) {
  usePicker();
  const store = usePickerStore();
  return (
    <div
      {...props}
      {...dayAttributes(store, date, outside)}
      role="gridcell"
      data-part="cell"
      ref={ref}
    />
  );
});
export const Number = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement> & { date: string }
>(function CalendarNumber({ date, children, ...props }, ref) {
  return (
    <span {...props} data-part="number" ref={ref}>
      {children ?? parseInt(date.slice(-2), 10)}
    </span>
  );
});
export const DayTrigger = forwardRef<
  HTMLButtonElement,
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> & {
    date: string;
    outside?: boolean;
    onSelect?: (date: string) => void;
  }
>(function DayTrigger({ date, outside, onSelect, ...props }, ref) {
  const store = usePickerStore(),
    state = usePicker(),
    node = useRef<HTMLButtonElement | null>(null),
    latest = useRef(onSelect);
  latest.current = onSelect;
  useEffect(
    () =>
      bindDayTrigger(node.current!, store, date, {
        outside,
        disabled: props.disabled ?? false,
        onSelect: (date) => latest.current?.(date),
      }),
    [store, date, outside, props.disabled],
  );
  return (
    <button
      {...props}
      {...dayTriggerAttributes(store, date, outside)}
      data-day-trigger=""
      disabled={
        props.disabled || state.options.disabled || store.getDay(date).disabled
      }
      tabIndex={date === state.focusedDate && !outside ? 0 : -1}
      type={props.type ?? "button"}
      ref={(el) => {
        node.current = el;
        assign(ref, el);
      }}
    />
  );
});
export const Heading = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement> & { offset?: number }
>(function Heading({ offset = 0, children, ...props }, ref) {
  const state = usePicker(),
    store = usePickerStore();
  return (
    <h3 {...props} aria-live="polite" ref={ref}>
      {children ?? formatMonth(store.getMonth(offset), state.options.locale)}
    </h3>
  );
});
export const Weekday = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement> & { day: number }
>(function Weekday({ day, children, ...props }, ref) {
  const s = usePicker(),
    label = weekdayLabels(s.options.locale, s.options.weekStartsOn).find(
      (d) => d.weekday === day,
    )?.label;
  return (
    <span
      {...props}
      role="columnheader"
      data-part="weekday"
      data-weekday={day}
      data-weekend={s.options.weekend.includes(day) ? "" : undefined}
      ref={ref}
    >
      {children ?? label}
    </span>
  );
});
export function Navigation({
  direction,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { direction: -1 | 1 }) {
  const s = usePicker(),
    store = usePickerStore();
  return (
    <button
      {...props}
      type="button"
      disabled={props.disabled || s.options.disabled}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) {
          try {
            store.navigate(direction);
          } catch (error) {
            if (!(error instanceof RangeError)) throw error;
          }
        }
      }}
    >
      {children ?? (direction === 1 ? "Next month" : "Previous month")}
    </button>
  );
}
