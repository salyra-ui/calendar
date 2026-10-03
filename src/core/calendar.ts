export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}
export type DateString = string;
export interface Month {
  year: number;
  month: number;
}
export interface CalendarGridOptions {
  weekStartsOn?: number;
  fixedWeeks?: boolean;
  outsideDays?: "visible" | "hidden";
}
export interface CalendarDay {
  readonly date: DateString;
  readonly day: number;
  readonly weekday: number;
  readonly outside: boolean;
  readonly hidden: boolean;
}
export interface CalendarMonth {
  readonly year: number;
  readonly month: number;
  readonly weeks: readonly (readonly CalendarDay[])[];
}
export function leapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
export function daysInMonth(year: number, month: number): number {
  if (
    !Number.isInteger(year) ||
    year < 1 ||
    year > 9999 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  )
    throw new RangeError(
      "Calendar supports Gregorian years 1–9999 and months 1–12",
    );
  return month === 2
    ? leapYear(year)
      ? 29
      : 28
    : [4, 6, 9, 11].includes(month)
      ? 30
      : 31;
}
export function parseDate(value: string): CalendarDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError("Use YYYY-MM-DD");
  const [, y, m, d] = match;
  const date = { year: Number(y), month: Number(m), day: Number(d) };
  if (date.day < 1 || date.day > daysInMonth(date.year, date.month))
    throw new RangeError("Invalid calendar date");
  return date;
}
export function dateString(date: CalendarDate): string {
  if (
    !Number.isInteger(date.day) ||
    date.day < 1 ||
    date.day > daysInMonth(date.year, date.month)
  )
    throw new RangeError("Invalid calendar date");
  return `${String(date.year).padStart(4, "0")}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}
/** Integer civil-day arithmetic, independent of local time zones and DST. */
export function dayNumber(input: CalendarDate | string): number {
  const date =
    typeof input === "string" ? parseDate(input) : parseDate(dateString(input));
  let y = date.year - (date.month <= 2 ? 1 : 0);
  const era = Math.floor(y / 400),
    yo = y - era * 400;
  const m = date.month + (date.month > 2 ? -3 : 9);
  const doy = Math.floor((153 * m + 2) / 5) + date.day - 1;
  return (
    era * 146097 +
    yo * 365 +
    Math.floor(yo / 4) -
    Math.floor(yo / 100) +
    doy -
    719468
  );
}
export function fromDayNumber(n: number): CalendarDate {
  if (!Number.isInteger(n))
    throw new RangeError("Day number must be an integer");
  const z = n + 719468,
    era = Math.floor(z / 146097),
    doe = z - era * 146097;
  const yo = Math.floor(
    (doe -
      Math.floor(doe / 1460) +
      Math.floor(doe / 36524) -
      Math.floor(doe / 146096)) /
      365,
  );
  let y = yo + era * 400;
  const doy = doe - (365 * yo + Math.floor(yo / 4) - Math.floor(yo / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp + (mp < 10 ? 3 : -9);
  y += month <= 2 ? 1 : 0;
  const result = { year: y, month, day };
  dateString(result);
  return result;
}
export function addDays(date: string, count: number): string {
  return dateString(fromDayNumber(dayNumber(date) + count));
}
export function weekday(date: string): number {
  return (((dayNumber(date) + 4) % 7) + 7) % 7;
}
export function addMonths(month: Month, count: number): Month {
  daysInMonth(month.year, month.month);
  if (!Number.isInteger(count))
    throw new RangeError("Month offset must be an integer");
  const n = (month.year - 1) * 12 + month.month - 1 + count;
  const next = {
    year: Math.floor(n / 12) + 1,
    month: (((n % 12) + 12) % 12) + 1,
  };
  daysInMonth(next.year, next.month);
  return next;
}
export function shiftDateMonths(value: string, count: number): string {
  const date = parseDate(value),
    next = addMonths(date, count);
  return dateString({
    ...next,
    day: Math.min(date.day, daysInMonth(next.year, next.month)),
  });
}
export function weekNumber(value: string): { year: number; week: number } {
  const n = dayNumber(value),
    dow = (weekday(value) + 6) % 7;
  const thursday = fromDayNumber(n + 3 - dow);
  const jan4 = `${String(thursday.year).padStart(4, "0")}-01-04`;
  const first = dayNumber(jan4) - ((weekday(jan4) + 6) % 7);
  return { year: thursday.year, week: Math.floor((n - first) / 7) + 1 };
}
export function validateWeekStart(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 6)
    throw new RangeError("weekStartsOn must be 0–6");
  return value;
}
export function createCalendarEngine(capacity = 48) {
  if (!Number.isInteger(capacity) || capacity < 1)
    throw new RangeError("Cache capacity must be positive");
  const cache = new Map<string, CalendarMonth>();
  return {
    month(
      year: number,
      month: number,
      options: CalendarGridOptions = {},
    ): CalendarMonth {
      daysInMonth(year, month);
      const start = validateWeekStart(options.weekStartsOn ?? 1);
      const key = `${year}:${month}:${start}:${!!options.fixedWeeks}:${options.outsideDays ?? "visible"}`;
      const cached = cache.get(key);
      if (cached) {
        cache.delete(key);
        cache.set(key, cached);
        return cached;
      }
      const first = dateString({ year, month, day: 1 }),
        leading = (weekday(first) - start + 7) % 7;
      const firstNumber = dayNumber(first),
        minNumber = dayNumber("0001-01-01"),
        maxNumber = dayNumber("9999-12-31");
      const length = options.fixedWeeks
        ? 42
        : Math.ceil((leading + daysInMonth(year, month)) / 7) * 7;
      const weeks: (readonly CalendarDay[])[] = [];
      for (let row = 0; row < length / 7; row++) {
        const cells: CalendarDay[] = [];
        for (let col = 0; col < 7; col++) {
          const n = firstNumber - leading + row * 7 + col;
          // Boundary padding stays empty at the supported year limits.
          if (n < minNumber || n > maxNumber) {
            cells.push(
              Object.freeze({
                date: "",
                day: 0,
                weekday: (start + col) % 7,
                outside: true,
                hidden: true,
              }),
            );
            continue;
          }
          const date = fromDayNumber(n),
            outside = date.month !== month;
          cells.push(
            Object.freeze({
              date: dateString(date),
              day: date.day,
              weekday: (start + col) % 7,
              outside,
              hidden: outside && options.outsideDays === "hidden",
            }),
          );
        }
        weeks.push(Object.freeze(cells));
      }
      const result = Object.freeze({
        year,
        month,
        weeks: Object.freeze(weeks),
      });
      cache.set(key, result);
      if (cache.size > capacity) cache.delete(cache.keys().next().value!);
      return result;
    },
    clear() {
      cache.clear();
    },
    get cacheSize() {
      return cache.size;
    },
  };
}
