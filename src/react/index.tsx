"use client";
export * from "../core";
export * from "./context";
export * from "./Root";
export * from "./Calendar";
export * from "./Fields";
import { Root, DateRoot, TimeRoot, DateTimeRoot } from "./Root";
import {
  CalendarView,
  Grid,
  Week,
  Cell,
  Number,
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
  Action,
  MonthSelect,
  YearSelect,
  Output,
} from "./Fields";
import { Continuous } from "./Continuous";
const parts = {
  Continuous,
  Field,
  Segment,
  Period,
  Time,
  Action,
  MonthSelect,
  YearSelect,
  Output,
  Grid,
  Week,
  Cell,
  Number,
  DayTrigger,
  Heading,
  Weekday,
  Navigation,
};
export const Calendar = { Root, ...parts, View: CalendarView };
export const DatePicker = { Root: DateRoot, ...parts, Calendar: CalendarView };
export const TimePicker = { Root: TimeRoot, ...parts };
export const DateTimePicker = {
  Root: DateTimeRoot,
  ...parts,
  Calendar: CalendarView,
};

export { Continuous } from "./Continuous";
