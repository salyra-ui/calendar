export * from "./index";
import { mountPicker as mountBase } from "@salyra-ui/calendar/vanilla";
import type { PickerStore } from "@salyra-ui/calendar";
import type { DateTimePickerOptions } from "./index";
export function mountPicker(
  element: HTMLElement,
  options: DateTimePickerOptions | PickerStore = {},
) {
  if ("getSnapshot" in options) {
    if (options.getSnapshot().options.kind !== "datetime")
      throw new RangeError("Use a datetime store with DateTimePicker");
    return mountBase(element, options);
  }
  return mountBase(element, { ...options, kind: "datetime" });
}
export const mountDateTimePicker = mountPicker;
