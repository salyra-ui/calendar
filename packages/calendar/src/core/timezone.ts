import { dayNumber, parseDate } from "./calendar";
import { timeSeconds } from "./time";
import type { DatePoint } from "./store";
/** Resolve an explicit wall date/time. Ambiguous or missing DST times reject by default. */
export function resolveZonedDateTime(
  point: DatePoint,
  timeZone: string,
  disambiguation: "reject" | "earlier" | "later" = "reject",
): Date {
  if (!point.date || !point.time)
    throw new RangeError("Date and time are required");
  parseDate(point.date);
  const target =
    dayNumber(point.date) * 86400000 + timeSeconds(point.time) * 1000;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    calendar: "gregory",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const wall = (stamp: number) => {
    const p = formatter.formatToParts(new Date(stamp));
    const get = (key: string) => p.find((v) => v.type === key)!.value;
    return (
      dayNumber(
        `${get("year").padStart(4, "0")}-${get("month")}-${get("day")}`,
      ) *
        86400000 +
      timeSeconds(`${get("hour")}:${get("minute")}:${get("second")}`) * 1000
    );
  };
  const offsets = new Set<number>();
  for (const hours of [-48, -24, -12, 0, 12, 24, 48]) {
    const n = target + hours * 3600000;
    offsets.add(wall(n) - n);
  }
  const candidates = [...offsets]
    .map((offset) => target - offset)
    .sort((a, b) => a - b);
  const matches = candidates.filter((n) => wall(n) === target);
  if (matches.length === 1) return new Date(matches[0]);
  if (disambiguation === "reject")
    throw new RangeError(
      matches.length
        ? "This local time occurs twice"
        : "This local time does not exist",
    );
  const choice = matches.length ? matches : candidates;
  return new Date(
    disambiguation === "earlier" ? choice[0] : choice[choice.length - 1],
  );
}
