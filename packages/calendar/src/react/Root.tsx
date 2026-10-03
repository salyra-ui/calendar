"use client";
import React, { useEffect, useRef, useState, type ReactNode } from "react";
import {
  createPickerStore,
  type PickerOptions,
  type PickerValue,
  type PickerStore,
} from "../core";
import { PickerContext } from "./context";
export interface RootProps extends PickerOptions {
  store?: PickerStore;
  children: ReactNode;
}
export function Root({
  store: provided,
  children,
  value,
  onValueChange,
  ...options
}: RootProps) {
  const [store] = useState(() => {
    if (!provided) return createPickerStore({ ...options, value });
    provided.setOptions(options);
    if (value !== undefined) provided.setValue(value);
    return provided;
  });
  const initial = store.getSnapshot().options;
  if (
    (options.kind && options.kind !== initial.kind) ||
    (options.selection && options.selection !== initial.selection)
  )
    throw new RangeError("Remount Root to change kind or selection");
  const latest = useRef(onValueChange);
  latest.current = onValueChange;
  useEffect(() => store.subscribeValue((v) => latest.current?.(v)), [store]);
  useEffect(() => {
    if (value !== undefined) store.setValue(value);
  }, [store, value]);
  const previous = useRef<PickerOptions>(options);
  useEffect(() => {
    const keys = new Set([
      ...Object.keys(previous.current),
      ...Object.keys(options),
    ]);
    const patch: PickerOptions = {};
    for (const key of keys) {
      if (["kind", "selection", "defaultValue", "month"].includes(key))
        continue;
      const k = key as keyof typeof options;
      if (!Object.is(previous.current[k], options[k]))
        Object.assign(patch, { [key]: options[k] });
    }
    previous.current = options;
    if (Object.keys(patch).length) store.setOptions(patch);
  });
  return (
    <PickerContext.Provider value={store}>{children}</PickerContext.Provider>
  );
}
export const DateRoot = (props: RootProps) => <Root {...props} kind="date" />;
export const TimeRoot = (props: RootProps) => <Root {...props} kind="time" />;
export const DateTimeRoot = (props: RootProps) => (
  <Root {...props} kind="datetime" />
);
