import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/ar";

dayjs.extend(utc);
dayjs.extend(timezone);

export const MADRASA_TZ = "Africa/Nouakchott";

/** Today's date (YYYY-MM-DD) in the madrasa's local timezone. */
export function todayISO(): string {
  return dayjs().tz(MADRASA_TZ).format("YYYY-MM-DD");
}

/** Current date/time in the madrasa's timezone. */
export function nowInMadrasa() {
  return dayjs().tz(MADRASA_TZ);
}

const WEEKDAYS_AR = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

/** Format an ISO date (YYYY-MM-DD) as "الاثنين 08/09/2026". */
export function formatArabicDate(isoDate: string): string {
  const d = dayjs.tz(isoDate, MADRASA_TZ);
  const weekday = WEEKDAYS_AR[d.day()];
  return `${weekday} ${d.format("DD/MM/YYYY")}`;
}

/** Format an ISO date (YYYY-MM-DD) as DD/MM/YYYY. */
export function formatShortDate(isoDate: string): string {
  return dayjs.tz(isoDate, MADRASA_TZ).format("DD/MM/YYYY");
}

/** Format a timestamp for display, e.g. in tables. */
export function formatDateTime(iso: string): string {
  return dayjs(iso).tz(MADRASA_TZ).format("DD/MM/YYYY HH:mm");
}

export function isValidISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value).isValid();
}
