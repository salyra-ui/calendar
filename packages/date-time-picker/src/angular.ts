export * from "./index";
export {
  PickerRoot,
  CalendarView,
  DayTrigger,
  CalendarNumber,
  Continuous,
  Grid,
  Week,
  Cell,
  Heading,
  Weekday,
  MonthYearSelect,
  Action,
  DateField,
  TimeSegmentField,
  PICKER_CONTEXT,
  usePickerStore,
} from "@salyra-ui/calendar/angular";
import { Calendar, PickerRoot, Action } from "@salyra-ui/calendar/angular";
import { DatePicker } from "@salyra-ui/date-picker/angular";
import { TimePicker } from "@salyra-ui/time-picker/angular";
export const DateTimePicker = {
  ...Calendar,
  ...DatePicker,
  ...TimePicker,
  Root: PickerRoot,
  Action,
  Calendar: DatePicker.Calendar,
  Field: DatePicker.Field,
  Segment: TimePicker.Segment,
};
