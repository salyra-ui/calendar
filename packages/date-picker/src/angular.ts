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
import {
  Calendar,
  PickerRoot,
  CalendarView,
  DateField,
  TimeSegmentField,
  Action,
} from "@salyra-ui/calendar/angular";
export const DatePicker = {
  ...Calendar,
  Root: PickerRoot,
  Action,
  Calendar: CalendarView,
  Field: DateField,
};
