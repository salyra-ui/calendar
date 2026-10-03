export * from "./index";
import { Calendar, DateTimeRoot } from "@salyra-ui/calendar/vue";
import { DatePicker } from "@salyra-ui/date-picker/vue";
import { TimePicker } from "@salyra-ui/time-picker/vue";
export const DateTimePicker = {
  ...Calendar,
  ...DatePicker,
  ...TimePicker,
  Root: DateTimeRoot,
  Calendar: Calendar.View,
};
export { usePickerStore } from "@salyra-ui/calendar/vue";

export { DateTimeRoot as Root } from "@salyra-ui/calendar/vue";
export {
  Field,
  Action,
  MonthSelect,
  YearSelect,
} from "@salyra-ui/date-picker/vue";
export { Segment, Period, Time } from "@salyra-ui/time-picker/vue";
