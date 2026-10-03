"use client";
export * from "./index";
import {
  Calendar,
  Segment,
  Period,
  Time,
  Action,
  Output,
  TimeRoot,
} from "@salyra-ui/calendar/react";
export const TimePicker = {
  ...Calendar,
  Root: TimeRoot,
  Segment,
  Period,
  Time,
  Action,
  Output,
};
export {
  TimeRoot as Root,
  Segment,
  Period,
  Time,
  Action,
  Output,
} from "@salyra-ui/calendar/react";
export { usePickerStore } from "@salyra-ui/calendar/react";
