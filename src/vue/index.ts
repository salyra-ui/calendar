export * from "../core";
export * from "./context";
export * from "./Root";
export * from "./Calendar";
export * from "./Fields";
export * from "./Continuous";
import { Root, DateRoot, TimeRoot, DateTimeRoot } from "./Root";
import {
  CalendarView,
  Grid,
  Week,
  Cell,
  NumberLabel,
  DayTrigger,
  Heading,
  Weekday,
  Navigation,
} from "./Calendar";
import {
  Field,
  Segment,
  Period,
  Time,
  MonthSelect,
  YearSelect,
  Action,
  Output,
} from "./Fields";
import { Continuous } from "./Continuous";
const parts = {
  Continuous,
  Grid,
  Week,
  Cell,
  Number: NumberLabel,
  DayTrigger,
  Heading,
  Weekday,
  Navigation,
  Field,
  Segment,
  Period,
  MonthSelect,
  YearSelect,
  Action,
  Time,
  Output,
};
export const Calendar = { Root, View: CalendarView, ...parts };
export const DatePicker = { Root: DateRoot, Calendar: CalendarView, ...parts };
export const TimePicker = { Root: TimeRoot, ...parts };
export const DateTimePicker = {
  Root: DateTimeRoot,
  Calendar: CalendarView,
  ...parts,
};
