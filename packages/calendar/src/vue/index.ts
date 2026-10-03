export * from "../core";
export * from "./context";
export * from "./Root";
export * from "./Calendar";
export * from "./Fields";
export * from "./Continuous";
import { Root } from "./Root";
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
import { Action, MonthSelect, YearSelect, Output } from "./Fields";
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
  MonthSelect,
  YearSelect,
  Action,
  Output,
};
export const Calendar = { Root, View: CalendarView, ...parts };
