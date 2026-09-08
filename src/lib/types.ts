import type { Tables } from "@/lib/database.types";

export type Profile = Tables<"profiles">;
export type Student = Tables<"students">;
export type Attendance = Tables<"daily_attendance">;
export type MadrasaSettings = Tables<"madrasa_settings">;
export type ReportTemplate = Tables<"report_templates">;
export type DailyReport = Tables<"daily_reports">;

export type AttendanceStatus = "present" | "absent" | "late";
export type StudentStatus = "active" | "inactive";
export type ReportType = "student" | "absence" | "general";
export type UserRole = "admin" | "supervisor";

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
};

export const ATTENDANCE_COLORS: Record<AttendanceStatus, string> = {
  present: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700",
  absent: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700",
  late: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
};

export interface GeneralReportRow {
  call_number: string;
  full_name: string;
  status: AttendanceStatus;
  daily_achievement: string;
}

export interface AbsenceReportRow {
  call_number: string;
  full_name: string;
  absence_reason: string;
  notes: string;
}
