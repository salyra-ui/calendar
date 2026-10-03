"use client";
export * from "./index";
import { Calendar, DateTimeRoot } from "@salyra-ui/calendar/react";
import { DatePicker } from "@salyra-ui/date-picker/react";
import { TimePicker } from "@salyra-ui/time-picker/react";
export const DateTimePicker = {
  ...Calendar,
  ...DatePicker,
  ...TimePicker,
  Root: DateTimeRoot,
  Calendar: Calendar.View,
};
export { usePickerStore } from "@salyra-ui/calendar/react";

export { DateTimeRoot as Root } from "@salyra-ui/calendar/react";
export {
  Field,
  Action,
  MonthSelect,
  YearSelect,
} from "@salyra-ui/date-picker/react";
export { Segment, Period, Time } from "@salyra-ui/time-picker/react";
