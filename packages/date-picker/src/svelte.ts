export * from "./index";
import {
  Calendar,
  Field,
  Action,
  MonthSelect,
  YearSelect,
  DateRoot,
} from "@salyra-ui/calendar/svelte";
export const DatePicker = {
  ...Calendar,
  Root: DateRoot,
  Field,
  Action,
  MonthSelect,
  YearSelect,
  Calendar: Calendar.View,
};
export {
  DateRoot as Root,
  Field,
  Action,
  MonthSelect,
  YearSelect,
} from "@salyra-ui/calendar/svelte";
export { usePickerStore } from "@salyra-ui/calendar/svelte";
