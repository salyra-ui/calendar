"use client";
export * from "../core";
export * from "./context";
export * from "./Root";
export * from "./Calendar";
export * from "./Fields";
import { Root } from "./Root";
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
import { Action, MonthSelect, YearSelect, Output } from "./Fields";
import { Continuous } from "./Continuous";
const parts = {
  Continuous,
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

export { Continuous } from "./Continuous";
