export * from "./index";
import { mountPicker as mountBase } from "@salyra-ui/calendar/vanilla";
import type { PickerStore } from "@salyra-ui/calendar";
import type { DatePickerOptions } from "./index";
export function mountPicker(
  element: HTMLElement,
  options: DatePickerOptions | PickerStore = {},
) {
  if ("getSnapshot" in options) {
    if (options.getSnapshot().options.kind !== "date")
      throw new RangeError("Use a date store with DatePicker");
    return mountBase(element, options);
  }
  return mountBase(element, { ...options, kind: "date" });
}
export const mountDatePicker = mountPicker;
