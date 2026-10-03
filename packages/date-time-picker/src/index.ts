export * from "@salyra-ui/calendar";
import {
  createPickerStore as createStore,
  type PickerOptions,
} from "@salyra-ui/calendar";
export type DateTimePickerOptions = Omit<PickerOptions, "kind">;
export function createPickerStore(options: DateTimePickerOptions = {}) {
  return createStore({ ...options, kind: "datetime" });
}
export const createDateTimePickerStore = createPickerStore;
