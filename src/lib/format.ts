// Centralized date formatting with an explicit timeZone. Without it,
// toLocaleString/toLocaleDateString use the runtime's local timezone —
// which differs between the Node server and the browser — causing React
// hydration mismatches whenever a date sits near a day boundary.
const TZ = "UTC";

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TZ });
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: TZ });
}

export function formatWeekday(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", timeZone: TZ });
}

export function formatDateTime(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

export function formatTime24(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour12: false, timeZone: TZ });
}
