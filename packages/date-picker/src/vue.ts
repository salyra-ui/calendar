export * from "./index";
import {
  Calendar,
  Field,
  Action,
  MonthSelect,
  YearSelect,
  Output,
  DateRoot,
} from "@salyra-ui/calendar/vue";
export const DatePicker = {
  ...Calendar,
  Root: DateRoot,
  Field,
  Action,
  MonthSelect,
  YearSelect,
  Output,
  Calendar: Calendar.View,
};
export {
  DateRoot as Root,
  Field,
  Action,
  MonthSelect,
  YearSelect,
  Output,
} from "@salyra-ui/calendar/vue";
export { usePickerStore } from "@salyra-ui/calendar/vue";
