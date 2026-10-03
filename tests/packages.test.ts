import { describe, it, expect } from "vitest";
import { createDatePickerStore } from "@salyra-ui/date-picker";
import { createTimePickerStore } from "@salyra-ui/time-picker";
import { createDateTimePickerStore } from "@salyra-ui/date-time-picker";

describe("separate package defaults", () => {
  it("date picker exports date-only values", () => {
    const store = createDatePickerStore({
      referenceDate: "2010-03-01",
      defaultValue: { date: "2010-03-09", time: "13:45" },
    });
    expect(store.getSnapshot().options.kind).toBe("date");
    expect(store.getSnapshot().value).toEqual({ date: "2010-03-09" });
  });
  it("time picker supports explicit multi-day offsets", () => {
    const store = createTimePickerStore({
      selection: "range",
      defaultValue: {
        start: { time: "23:00", dayOffset: 0 },
        end: { time: "02:00", dayOffset: 3 },
      },
    });
    expect(store.getSnapshot().options.kind).toBe("time");
    expect(store.getSnapshot().value).toEqual({
      start: { time: "23:00", dayOffset: 0 },
      end: { time: "02:00", dayOffset: 3 },
    });
  });
  it("date-time picker preserves dates and clocks", () => {
    const store = createDateTimePickerStore({
      selection: "range",
      defaultValue: {
        start: { date: "2010-03-09", time: "23:00" },
        end: { date: "2010-03-12", time: "02:00" },
      },
    });
    expect(store.getSnapshot().options.kind).toBe("datetime");
    expect(store.getSnapshot().value).toEqual({
      start: { date: "2010-03-09", time: "23:00" },
      end: { date: "2010-03-12", time: "02:00" },
    });
  });
});
