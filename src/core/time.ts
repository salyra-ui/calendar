export function timeSeconds(value: string): number {
  const m = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59 || Number(m[3] ?? 0) > 59)
    throw new RangeError("Use HH:mm or HH:mm:ss");
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3] ?? 0);
}
export function timeString(seconds: number, withSeconds = false): string {
  if (!Number.isInteger(seconds) || seconds < 0 || seconds > 86399)
    throw new RangeError("Time must fit within a day");
  const parts = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60];
  if (withSeconds) parts.push(seconds % 60);
  return parts.map((n) => String(n).padStart(2, "0")).join(":");
}
export function timeParts(value: string, hourCycle: 12 | 24 = 24) {
  const seconds = timeSeconds(value),
    hour = Math.floor(seconds / 3600);
  return {
    hour: hourCycle === 12 ? hour % 12 || 12 : hour,
    minute: Math.floor(seconds / 60) % 60,
    second: seconds % 60,
    period: hour < 12 ? "AM" : "PM",
  } as const;
}
export function updateTime(
  value: string,
  part: "hour" | "minute" | "second" | "period",
  next: number | string,
  hourCycle: 12 | 24 = 24,
  seconds = false,
): string {
  const p = timeParts(value, 24);
  let h = p.hour,
    m = p.minute,
    s = p.second;
  if (part === "period") {
    if (next !== "AM" && next !== "PM") throw new RangeError("Use AM or PM");
    h = (h % 12) + (next === "PM" ? 12 : 0);
  } else {
    const n = Number(next),
      max = part === "hour" ? (hourCycle === 12 ? 12 : 23) : 59,
      min = part === "hour" && hourCycle === 12 ? 1 : 0;
    if (!Number.isInteger(n) || n < min || n > max)
      throw new RangeError("Invalid time segment");
    if (part === "hour")
      h = hourCycle === 12 ? (n % 12) + (p.period === "PM" ? 12 : 0) : n;
    if (part === "minute") m = n;
    if (part === "second") s = n;
  }
  return timeString(h * 3600 + m * 60 + s, seconds);
}
export function timeSlots(
  stepMinutes = 30,
  min = "00:00",
  max = "23:59",
): readonly string[] {
  if (!Number.isInteger(stepMinutes) || stepMinutes < 1 || stepMinutes > 1440)
    throw new RangeError("Time step must be 1–1440 minutes");
  const slots: string[] = [],
    first = timeSeconds(min),
    last = timeSeconds(max),
    seconds = min.length === 8 || max.length === 8;
  if (first > last)
    throw new RangeError("Time slot bounds must be ordered within one day");
  for (let n = first; n <= last; n += stepMinutes * 60)
    slots.push(timeString(n, seconds));
  return Object.freeze(slots);
}

/** Preserve an empty segment until a time has actually been chosen. */
export function timeSegmentValue(
  time: string | undefined,
  part: keyof ReturnType<typeof timeParts>,
  hourCycle: 12 | 24 = 24,
): string {
  return !time && part !== "period"
    ? ""
    : String(timeParts(time ?? "00:00", hourCycle)[part]);
}
