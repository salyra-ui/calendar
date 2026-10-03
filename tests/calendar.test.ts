import { describe, it, expect } from "vitest";
import {
  dayNumber,
  fromDayNumber,
  dateString,
  weekday,
  createCalendarEngine,
  daysInMonth,
  addDays,
  addMonths,
  weekNumber,
} from "../packages/calendar/src/core";
describe("Gregorian calculations", () => {
  it("matches an independent UTC reference across historical and future years", () => {
    for (const year of [
      1, 4, 99, 100, 400, 1582, 1900, 2000, 2010, 2024, 2100, 9999,
    ])
      for (let month = 1; month <= 12; month++)
        for (const day of [1, daysInMonth(year, month)]) {
          const value = dateString({ year, month, day }),
            ref = new Date(0);
          ref.setUTCFullYear(year, month - 1, day);
          ref.setUTCHours(0, 0, 0, 0);
          expect(dayNumber(value)).toBe(ref.getTime() / 86400000);
          expect(weekday(value)).toBe(ref.getUTCDay());
          expect(fromDayNumber(dayNumber(value))).toEqual({ year, month, day });
        }
  });
  it("renders March 2010 with Monday first and correct outside days", () => {
    const month = createCalendarEngine().month(2010, 3);
    expect(month.weeks[0][0].date).toBe("2010-03-01");
    expect(month.weeks.at(-1)?.at(-1)?.date).toBe("2010-04-04");
    expect(month.weeks).toHaveLength(5);
  });
  it("handles leap-century rules and rejects invalid dates", () => {
    expect(daysInMonth(1900, 2)).toBe(28);
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(2100, 2)).toBe(28);
    expect(() => dayNumber("2010-02-29")).toThrow();
    expect(() => dayNumber("2024-01-32")).toThrow();
  });
  it("aligns every week-start and fixed/hidden grid without shifting dates", () => {
    const engine = createCalendarEngine();
    for (let start = 0; start < 7; start++) {
      const m = engine.month(2026, 10, {
        weekStartsOn: start,
        fixedWeeks: true,
        outsideDays: "hidden",
      });
      expect(m.weeks).toHaveLength(6);
      for (const week of m.weeks) {
        expect(week[0].weekday).toBe(start);
        week.forEach((d, i) => {
          expect(d.weekday).toBe((start + i) % 7);
          expect(d.hidden).toBe(d.outside);
        });
      }
    }
  });
  it("bounds its cache and returns stable immutable month grids", () => {
    const e = createCalendarEngine(3),
      a = e.month(2010, 3);
    expect(e.month(2010, 3)).toBe(a);
    expect(Object.isFrozen(a.weeks[0])).toBe(true);
    for (let m = 1; m <= 12; m++) e.month(2026, m);
    expect(e.cacheSize).toBe(3);
  });
  it("handles year boundaries and ISO week-year boundaries", () => {
    expect(addDays("2024-12-31", 1)).toBe("2025-01-01");
    expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({
      year: 2025,
      month: 12,
    });
    expect(weekNumber("2021-01-01")).toEqual({ year: 2020, week: 53 });
  });
  it("leaves year-limit padding empty rather than throwing", () => {
    expect(() =>
      createCalendarEngine().month(1, 1, { weekStartsOn: 0 }),
    ).not.toThrow();
    expect(() =>
      createCalendarEngine().month(9999, 12, { fixedWeeks: true }),
    ).not.toThrow();
  });
});
