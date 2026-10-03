export * from "@salyra-ui/calendar";
import {
  createPickerStore as createStore,
  type PickerOptions,
} from "@salyra-ui/calendar";
export type TimePickerOptions = Omit<PickerOptions, "kind">;
export function createPickerStore(options: TimePickerOptions = {}) {
  return createStore({ ...options, kind: "time" });
}
export const createTimePickerStore = createPickerStore;
