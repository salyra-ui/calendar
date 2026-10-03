import { parseDate, type Month } from "./calendar";
const formatters = new Map<string, Intl.DateTimeFormat>();
export function dateFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
) {
  const key = JSON.stringify([locale, options]);
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, {
      ...options,
      calendar: "gregory",
      timeZone: "UTC",
    });
    formatters.set(key, f);
    if (formatters.size > 32)
      formatters.delete(formatters.keys().next().value!);
  }
  return f;
}
export function utcDate(value: string): Date {
  const { year, month, day } = parseDate(value);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(12, 0, 0, 0);
  return date;
}
export function formatDate(
  value: string,
  locale = "en-GB",
  options: Intl.DateTimeFormatOptions = { dateStyle: "long" },
) {
  return dateFormatter(locale, options).format(utcDate(value));
}
export function formatMonth(month: Month, locale = "en-GB") {
  return formatDate(
    `${String(month.year).padStart(4, "0")}-${String(month.month).padStart(2, "0")}-01`,
    locale,
    { month: "long", year: "numeric" },
  );
}
export function weekdayLabels(
  locale: string,
  weekStartsOn: number,
  width: "short" | "long" | "narrow" = "short",
) {
  const formatter = dateFormatter(locale, { weekday: width });
  return Array.from({ length: 7 }, (_, i) => {
    const day = (weekStartsOn + i) % 7;
    return {
      weekday: day,
      label: formatter.format(
        utcDate(`2023-01-${String(day + 1).padStart(2, "0")}`),
      ),
    };
  });
}
export function today(timeZone = "UTC", now: Date = new Date()): string {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    calendar: "gregory",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => p.find((x) => x.type === type)!.value;
  return `${get("year").padStart(4, "0")}-${get("month")}-${get("day")}`;
}
