"use client";
import { createContext, useContext, useSyncExternalStore } from "react";
import type { PickerStore } from "../core";
export const PickerContext = createContext<PickerStore | null>(null);
export function usePickerStore() {
  const store = useContext(PickerContext);
  if (!store) throw new Error("Picker components require Root");
  return store;
}
export function usePicker() {
  const store = usePickerStore();
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
}
export function useCalendarMonth(offset = 0) {
  usePicker();
  return usePickerStore().getMonth(offset);
}
