"use client";
import React, {
  forwardRef,
  useEffect,
  useRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type ButtonHTMLAttributes,
} from "react";
import {
  bindDateField,
  bindTimeSegment,
  pointFor,
  timeSegmentValue,
  type Endpoint,
  type TimeSegment,
} from "../core";
import { usePickerStore, usePicker } from "./context";
function assign<T>(ref: React.ForwardedRef<T>, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}
export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { endpoint?: Endpoint }
>(function Field({ endpoint = "start", ...props }, ref) {
  const store = usePickerStore(),
    node = useRef<HTMLInputElement | null>(null);
  useEffect(
    () => bindDateField(node.current!, store, endpoint),
    [store, endpoint, props.disabled, props.readOnly],
  );
  return (
    <input
      {...props}
      type="text"
      defaultValue={
        props.defaultValue ??
        pointFor(store.getSnapshot().draft, endpoint)?.date ??
        ""
      }
      placeholder={props.placeholder ?? "YYYY-MM-DD"}
      ref={(el) => {
        node.current = el;
        assign(ref, el);
      }}
    />
  );
});
export const Segment = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    part: Exclude<TimeSegment, "period">;
    endpoint?: Endpoint;
  }
>(function Segment({ part, endpoint = "start", ...props }, ref) {
  const store = usePickerStore(),
    node = useRef<HTMLInputElement | null>(null);
  useEffect(
    () => bindTimeSegment(node.current!, store, part, endpoint),
    [store, part, endpoint, props.disabled, props.readOnly],
  );
  return (
    <input
      {...props}
      type="number"
      data-part={part}
      defaultValue={
        props.defaultValue ??
        timeSegmentValue(
          pointFor(store.getSnapshot().draft, endpoint)?.time,
          part,
          store.getSnapshot().options.hourCycle,
        )
      }
      ref={(el) => {
        node.current = el;
        assign(ref, el);
      }}
    />
  );
});
export const Period = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { endpoint?: Endpoint }
>(function Period({ endpoint = "start", children, ...props }, ref) {
  const store = usePickerStore(),
    node = useRef<HTMLSelectElement | null>(null);
  useEffect(
    () => bindTimeSegment(node.current!, store, "period", endpoint),
    [store, endpoint, props.disabled],
  );
  return (
    <select
      {...props}
      defaultValue={
        props.defaultValue ??
        timeSegmentValue(
          pointFor(store.getSnapshot().draft, endpoint)?.time,
          "period",
          store.getSnapshot().options.hourCycle,
        )
      }
      ref={(el) => {
        node.current = el;
        assign(ref, el);
      }}
    >
      {children ?? (
        <>
          <option>AM</option>
          <option>PM</option>
        </>
      )}
    </select>
  );
});
export function Time({
  endpoint = "start",
  className,
  labels = {},
  ...attributes
}: React.HTMLAttributes<HTMLDivElement> & {
  endpoint?: Endpoint;
  labels?: Partial<Record<TimeSegment, string>>;
}) {
  const s = usePicker();
  return (
    <div {...attributes} className={className ?? "sp-time"}>
      <label>
        {labels.hour ?? "Hours"}
        <Segment part="hour" endpoint={endpoint} />
      </label>
      <label>
        {labels.minute ?? "Minutes"}
        <Segment part="minute" endpoint={endpoint} />
      </label>
      {s.options.seconds && (
        <label>
          {labels.second ?? "Seconds"}
          <Segment part="second" endpoint={endpoint} />
        </label>
      )}
      {s.options.hourCycle === 12 && (
        <label>
          {labels.period ?? "Period"}
          <Period endpoint={endpoint} />
        </label>
      )}
    </div>
  );
}
export function Action({
  action,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  action: "apply" | "cancel" | "clear";
}) {
  const store = usePickerStore(),
    s = usePicker();
  return (
    <button
      {...props}
      type="button"
      disabled={props.disabled || s.options.disabled || s.options.readOnly}
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.defaultPrevented) store[action]();
      }}
    >
      {children ?? action}
    </button>
  );
}
export function MonthSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const store = usePickerStore(),
    s = usePicker();
  return (
    <select
      {...props}
      disabled={props.disabled || s.options.disabled}
      value={s.visibleMonth.month}
      onChange={(e) => {
        props.onChange?.(e);
        if (!e.defaultPrevented)
          store.setVisibleMonth({
            ...s.visibleMonth,
            month: globalThis.Number(e.target.value),
          });
      }}
    >
      {props.children ??
        Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={i + 1}>
            {i + 1}
          </option>
        ))}
    </select>
  );
}
export function YearSelect({
  from = 1900,
  to = 2100,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { from?: number; to?: number }) {
  const store = usePickerStore(),
    s = usePicker();
  return (
    <select
      {...props}
      disabled={props.disabled || s.options.disabled}
      value={s.visibleMonth.year}
      onChange={(e) => {
        props.onChange?.(e);
        if (!e.defaultPrevented)
          store.setVisibleMonth({
            ...s.visibleMonth,
            year: globalThis.Number(e.target.value),
          });
      }}
    >
      {props.children ??
        Array.from({ length: to - from + 1 }, (_, i) => (
          <option key={i} value={from + i}>
            {from + i}
          </option>
        ))}
    </select>
  );
}
export function Output(props: React.HTMLAttributes<HTMLOutputElement>) {
  const s = usePicker();
  return (
    <output {...props}>{props.children ?? JSON.stringify(s.value)}</output>
  );
}
