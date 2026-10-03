export * from "./index";
import { mountPicker as mountBase } from "@salyra-ui/calendar/vanilla";
import type { PickerStore } from "@salyra-ui/calendar";
import type { TimePickerOptions } from "./index";
export function mountPicker(
  element: HTMLElement,
  options: TimePickerOptions | PickerStore = {},
) {
  if ("getSnapshot" in options) {
    if (options.getSnapshot().options.kind !== "time")
      throw new RangeError("Use a time store with TimePicker");
    return mountBase(element, options);
  }
  return mountBase(element, { ...options, kind: "time" });
}
export const mountTimePicker = mountPicker;
