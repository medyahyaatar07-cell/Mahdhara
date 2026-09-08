import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayISO, isValidISODate } from "@/lib/dates";
import { StudentReportEditor, type StudentReportInitial } from "@/components/report-editors/student-report-editor";

export const dynamic = "force-dynamic";
// PDF generation launches a headless browser, which can take longer than the
// platform's default Server Action timeout, especially on a cold start.
export const maxDuration = 60;

export default async function NewStudentReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { studentId } = await params;
  const { date } = await searchParams;
  const reportDate = date && isValidISODate(date) ? date : todayISO();

  const supabase = await createClient();
  const [{ data: student }, { data: settings }, { data: attendance }, { data: existing }] =
    await Promise.all([
      supabase.from("students").select("*").eq("id", studentId).single(),
      supabase.from("madrasa_settings").select("*").eq("id", 1).single(),
      supabase
        .from("daily_attendance")
        .select("*")
        .eq("student_id", studentId)
        .eq("date", reportDate)
        .maybeSingle(),
      supabase
        .from("daily_reports")
        .select("*")
        .eq("student_id", studentId)
        .eq("report_date", reportDate)
        .eq("report_type", "student")
        .maybeSingle(),
    ]);

  if (!student) notFound();

  const defaults: StudentReportInitial = {
    reportTitle: settings?.default_report_title || "التقرير اليومي للطالب",
    madrasaName: settings?.show_supervisor === false ? "" : settings?.madrasa_name || "",
    madrasaAddress: settings?.show_address === false ? "" : settings?.address || "",
    supervisorName: settings?.show_supervisor === false ? "" : settings?.supervisor_name || "",
    phone: settings?.show_phone === false ? "" : settings?.phone || "",
    logoUrl: settings?.show_logo === false ? "" : settings?.logo_url || "",
    studentName: student.full_name,
    callNumber: student.call_number,
    level: student.level || "",
    attendanceStatus: (attendance?.status as StudentReportInitial["attendanceStatus"]) || "present",
    dailyAchievement: attendance?.daily_achievement || "",
    notes: attendance?.notes || "",
  };

  const initial: StudentReportInitial = existing
    ? {
        reportTitle: existing.report_title,
        madrasaName: existing.madrasa_name_snapshot || "",
        madrasaAddress: existing.madrasa_address_snapshot || "",
        supervisorName: existing.supervisor_name_snapshot || "",
        phone: existing.phone_snapshot || "",
        logoUrl: existing.logo_snapshot || "",
        studentName: existing.student_name_snapshot || student.full_name,
        callNumber: existing.call_number_snapshot || student.call_number,
        level: existing.level_snapshot || student.level || "",
        attendanceStatus:
          (existing.attendance_status_snapshot as StudentReportInitial["attendanceStatus"]) ||
          "present",
        dailyAchievement: existing.daily_achievement_snapshot || "",
        notes: existing.notes_snapshot || "",
      }
    : defaults;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">
        {existing ? "تعديل تقرير" : "إنشاء تقرير"} — {student.full_name}
      </h1>
      <StudentReportEditor
        studentId={studentId}
        reportDate={reportDate}
        initial={initial}
        defaults={defaults}
        hasExistingReport={!!existing}
      />
    </div>
  );
}
