import { it, expect } from "vitest";
import {
  createPickerStore,
  resolveZonedDateTime,
  updateTime,
  timeSlots,
} from "../packages/calendar/src/core";
it("keeps navigation separate from selection", () => {
  const s = createPickerStore({ value: { date: "2026-10-03" } });
  s.setVisibleMonth({ year: 2010, month: 3 });
  expect(s.getMonth().weeks[0][0].date).toBe("2010-03-01");
  expect(s.getSnapshot().value).toEqual({ date: "2026-10-03" });
});
it("emits only complete ranges and normalizes reversed date clicks", () => {
  const s = createPickerStore({ selection: "range" }),
    values: unknown[] = [];
  s.subscribeValue((v) => values.push(v));
  s.selectDate("2026-10-20");
  s.hover("2026-10-10");
  expect(s.getDay("2026-10-15").inRange).toBe(true);
  expect(values).toHaveLength(0);
  s.selectDate("2026-10-10");
  expect(s.getSnapshot().value).toEqual({
    start: { date: "2026-10-10" },
    end: { date: "2026-10-20" },
  });
  expect(values).toHaveLength(1);
});
it("keeps explicit drafts separate and supports cancel", () => {
  const s = createPickerStore({
    commit: "explicit",
    value: { date: "2026-10-03" },
  });
  s.selectDate("2026-10-09");
  expect(s.getSnapshot().value).toEqual({ date: "2026-10-03" });
  s.cancel();
  expect(s.getSnapshot().draft).toEqual({ date: "2026-10-03" });
  s.selectDate("2026-10-10");
  expect(s.apply()).toBe(true);
  expect(s.getSnapshot().value).toEqual({ date: "2026-10-10" });
});
it("does not assume that an earlier end time is tomorrow", () => {
  const s = createPickerStore({ kind: "time", selection: "range" });
  s.setTime("22:00");
  expect(s.setTime("02:00", "end")).toBe(false);
  expect(s.getSnapshot().error).toContain("end");
  s.setDayOffset(3);
  s.setTime("02:00", "end");
  expect(s.getSnapshot().value).toEqual({
    start: { time: "22:00" },
    end: { time: "02:00", dayOffset: 3 },
  });
});
it("accepts explicit end dates before entering the time", () => {
  const s = createPickerStore({ kind: "time", selection: "range" });
  s.setDate("2026-10-03");
  s.setTime("22:00");
  s.setDate("2026-10-06", "end");
  s.setTime("09:30", "end");
  expect(s.getSnapshot().value).toEqual({
    start: { date: "2026-10-03", time: "22:00" },
    end: { date: "2026-10-06", time: "09:30" },
  });
});
it("exports only date fields from a date picker", () => {
  const s = createPickerStore({
    value: { date: "2026-10-03", time: "22:00", dayOffset: 8 },
  });
  expect(s.getSnapshot().value).toEqual({ date: "2026-10-03" });
});
it("validates constraints, duration and disabled without blocking programmatic updates", () => {
  const s = createPickerStore({
    selection: "range",
    minDate: "2026-10-03",
    minDuration: 3,
  });
  expect(s.selectDate("2026-10-01")).toBe(false);
  s.selectDate("2026-10-03");
  expect(s.selectDate("2026-10-04")).toBe(false);
  s.selectDate("2026-10-05");
  s.setOptions({ disabled: true });
  expect(s.selectDate("2026-10-10")).toBe(false);
  s.setValue({ start: { date: "2026-10-10" }, end: { date: "2026-10-14" } });
  expect(s.getSnapshot().value).toEqual({
    start: { date: "2026-10-10" },
    end: { date: "2026-10-14" },
  });
});
it("does not mutate caller data and isolates stores for SSR requests", () => {
  const input = { date: "2026-10-03" },
    a = createPickerStore({ value: input, referenceDate: "2026-10-03" }),
    b = createPickerStore({ referenceDate: "2010-03-01" });
  input.date = "2000-01-01";
  expect(a.getSnapshot().value).toEqual({ date: "2026-10-03" });
  a.selectDate("2026-10-09");
  expect(b.getSnapshot().value).toBe(null);
});
it("converts 12-hour segments and generates bounded slots", () => {
  expect(updateTime("13:30", "hour", 12, 12)).toBe("12:30");
  expect(updateTime("00:00", "period", "PM", 12)).toBe("12:00");
  expect(timeSlots(30, "09:00", "10:00")).toEqual(["09:00", "09:30", "10:00"]);
});
it("requires a choice for missing or duplicated DST times", () => {
  expect(() =>
    resolveZonedDateTime(
      { date: "2026-03-29", time: "03:30" },
      "Europe/Bucharest",
    ),
  ).toThrow("does not exist");
  expect(() =>
    resolveZonedDateTime(
      { date: "2026-10-25", time: "03:30" },
      "Europe/Bucharest",
    ),
  ).toThrow("occurs twice");
  const p = { date: "2026-10-25", time: "03:30" };
  expect(
    resolveZonedDateTime(p, "Europe/Bucharest", "later").getTime() -
      resolveZonedDateTime(p, "Europe/Bucharest", "earlier").getTime(),
  ).toBe(3600000);
});

it("allows entering both times after a same-day datetime range", () => {
  const s = createPickerStore({
    kind: "datetime",
    selection: "range",
    referenceDate: "2026-10-03",
  });
  s.selectDate("2026-10-03");
  s.selectDate("2026-10-03");
  expect(s.setTime("10:00")).toBe(true);
  expect(s.getSnapshot().value).toEqual({ start: null, end: null });
  expect(s.setTime("12:00", "end")).toBe(true);
  expect(s.validate()).toBe(null);
});
it("focuses December 9999 without overflowing the multi-month window", () => {
  const s = createPickerStore({ referenceDate: "9999-11-01", months: 2 });
  s.focus("9999-12-31");
  expect(s.getSnapshot().visibleMonth).toEqual({ year: 9999, month: 11 });
  expect(s.getMonth(1).month).toBe(12);
});
it("keeps a stable snapshot when options have not changed", () => {
  const s = createPickerStore({ disabled: false });
  const snapshot = s.getSnapshot();
  s.setOptions({ disabled: false });
  expect(s.getSnapshot()).toBe(snapshot);
});

it("clears an explicit selection when the empty draft is applied", () => {
  const s = createPickerStore({
    commit: "explicit",
    value: { date: "2026-10-03" },
  });
  s.clear();
  expect(s.getSnapshot().value).toEqual({ date: "2026-10-03" });
  expect(s.apply()).toBe(true);
  expect(s.getSnapshot().value).toBe(null);
});

it("keeps a constraint-invalid time draft so segments can complete a valid clock", () => {
  const s = createPickerStore({
    kind: "time",
    minTime: "09:30",
    referenceDate: "2026-10-03",
  });
  expect(s.setTime("09:00")).toBe(false);
  expect(s.getSnapshot().draft).toEqual({ time: "09:00" });
  expect(s.getSnapshot().value).toBe(null);
  expect(s.setTime("09:30")).toBe(true);
  expect(s.getSnapshot().value).toEqual({ time: "09:30" });
});
it("preserves seconds in generated slots and rejects reversed same-day bounds", () => {
  expect(timeSlots(30, "09:00:45", "10:00:45")).toEqual([
    "09:00:45",
    "09:30:45",
    "10:00:45",
  ]);
  expect(() => timeSlots(30, "22:00", "02:00")).toThrow();
});
