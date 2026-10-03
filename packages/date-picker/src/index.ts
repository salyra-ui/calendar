export * from "@salyra-ui/calendar";
import {
  createPickerStore as createStore,
  type PickerOptions,
} from "@salyra-ui/calendar";
export type DatePickerOptions = Omit<PickerOptions, "kind">;
export function createPickerStore(options: DatePickerOptions = {}) {
  return createStore({ ...options, kind: "date" });
}
export const createDatePickerStore = createPickerStore;
