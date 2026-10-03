export * from "./index";
import { Calendar, DateTimeRoot } from "@salyra-ui/calendar/svelte";
import { DatePicker } from "@salyra-ui/date-picker/svelte";
import { TimePicker } from "@salyra-ui/time-picker/svelte";
export const DateTimePicker = {
  ...Calendar,
  ...DatePicker,
  ...TimePicker,
  Root: DateTimeRoot,
  Calendar: Calendar.View,
};
export { usePickerStore } from "@salyra-ui/calendar/svelte";

export { DateTimeRoot as Root } from "@salyra-ui/calendar/svelte";
export {
  Field,
  Action,
  MonthSelect,
  YearSelect,
} from "@salyra-ui/date-picker/svelte";
export { Segment, Period, Time } from "@salyra-ui/time-picker/svelte";
