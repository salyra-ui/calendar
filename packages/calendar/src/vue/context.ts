import { inject, onScopeDispose, shallowRef, type InjectionKey } from "vue";
import type { PickerStore } from "../core";
export const pickerContext: InjectionKey<PickerStore> =
  Symbol("Salyra calendar");
export function usePickerStore() {
  const store = inject(pickerContext);
  if (!store) throw new Error("Picker components require Root");
  return store;
}
export function usePicker() {
  const store = usePickerStore(),
    state = shallowRef(store.getSnapshot());
  onScopeDispose(store.subscribe(() => (state.value = store.getSnapshot())));
  return state;
}
