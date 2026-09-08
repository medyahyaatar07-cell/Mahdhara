import { createClient } from "@/lib/supabase/server";
import { todayISO, isValidISODate } from "@/lib/dates";
import { GeneralReportEditor, type GeneralReportInitial } from "@/components/report-editors/general-report-editor";
import type { GeneralReportRow, AttendanceStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
// PDF generation launches a headless browser, which can take longer than the
// platform's default Server Action timeout, especially on a cold start.
export const maxDuration = 60;

export default async function NewGeneralReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const reportDate = date && isValidISODate(date) ? date : todayISO();

  const supabase = await createClient();
  const [{ data: settings }, { data: students }, { data: attendance }, { data: existing }] =
    await Promise.all([
      supabase.from("madrasa_settings").select("*").eq("id", 1).single(),
      supabase
        .from("students")
        .select("id, call_number, full_name")
        .eq("status", "active")
        .order("call_number"),
      supabase
        .from("daily_attendance")
        .select("student_id, status, daily_achievement")
        .eq("date", reportDate),
      supabase
        .from("daily_reports")
        .select("*")
        .eq("report_date", reportDate)
        .eq("report_type", "general")
        .maybeSingle(),
    ]);

  const attendanceByStudent = new Map(
    (attendance || []).map((a) => [a.student_id, a])
  );

  const derivedRows: GeneralReportRow[] = (students || []).map((s) => {
    const a = attendanceByStudent.get(s.id);
    return {
      call_number: s.call_number,
      full_name: s.full_name,
      status: (a?.status as AttendanceStatus) || "absent",
      daily_achievement: a?.daily_achievement || "",
    };
  });

  const defaults: GeneralReportInitial = {
    reportTitle: "التقرير اليومي للمحضرة",
    madrasaName: settings?.madrasa_name || "",
    madrasaAddress: settings?.address || "",
    supervisorName: settings?.supervisor_name || "",
    phone: settings?.phone || "",
    logoUrl: settings?.logo_url || "",
    rows: derivedRows,
  };

  const initial: GeneralReportInitial = existing
    ? {
        reportTitle: existing.report_title,
        madrasaName: existing.madrasa_name_snapshot || "",
        madrasaAddress: existing.madrasa_address_snapshot || "",
        supervisorName: existing.supervisor_name_snapshot || "",
        phone: existing.phone_snapshot || "",
        logoUrl: existing.logo_snapshot || "",
        rows: (existing.extra_data as { rows?: GeneralReportRow[] })?.rows || derivedRows,
      }
    : defaults;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">التقرير اليومي العام</h1>
      <GeneralReportEditor
        reportDate={reportDate}
        initial={initial}
        defaults={defaults}
        hasExistingReport={!!existing}
      />
    </div>
  );
}
