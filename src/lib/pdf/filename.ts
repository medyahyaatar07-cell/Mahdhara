import type { DailyReport } from "@/lib/types";

function slug(value: string): string {
  return value.trim().replace(/\s+/g, "_");
}

export function reportFileName(report: DailyReport): string {
  if (report.report_type === "student") {
    return `تقرير_${slug(report.student_name_snapshot || "طالب")}_${report.report_date}.pdf`;
  }
  if (report.report_type === "absence") {
    return `تقرير_الغياب_${report.report_date}.pdf`;
  }
  return `التقرير_اليومي_للمحضرة_${report.report_date}.pdf`;
}

export function reportStoragePath(report: DailyReport): string {
  return `${report.report_type}/${report.id}.pdf`;
}
