import { getContext, setContext } from "svelte";
import { readable } from "svelte/store";
import type { PickerStore } from "../core";
const key = Symbol("Salyra calendar");
export function providePicker(store: PickerStore) {
  setContext(key, store);
  return store;
}
export function usePickerStore() {
  const store = getContext<PickerStore>(key);
  if (!store) throw new Error("Picker components require Root");
  return store;
}
export function usePicker() {
  const store = usePickerStore();
  return readable(store.getSnapshot(), (set) =>
    store.subscribe(() => set(store.getSnapshot())),
  );
}
