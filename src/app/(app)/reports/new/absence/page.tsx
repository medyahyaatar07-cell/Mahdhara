import { createClient } from "@/lib/supabase/server";
import { todayISO, isValidISODate } from "@/lib/dates";
import { AbsenceReportEditor, type AbsenceReportInitial } from "@/components/report-editors/absence-report-editor";
import type { AbsenceReportRow } from "@/lib/types";

export const dynamic = "force-dynamic";
// PDF generation launches a headless browser, which can take longer than the
// platform's default Server Action timeout, especially on a cold start.
export const maxDuration = 60;

export default async function NewAbsenceReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const reportDate = date && isValidISODate(date) ? date : todayISO();

  const supabase = await createClient();
  const [{ data: settings }, { data: absentAttendance }, { data: existing }] = await Promise.all([
    supabase.from("madrasa_settings").select("*").eq("id", 1).single(),
    supabase
      .from("daily_attendance")
      .select("absence_reason, notes, students(call_number, full_name)")
      .eq("date", reportDate)
      .eq("status", "absent"),
    supabase
      .from("daily_reports")
      .select("*")
      .eq("report_date", reportDate)
      .eq("report_type", "absence")
      .maybeSingle(),
  ]);

  const derivedRows: AbsenceReportRow[] = (absentAttendance || [])
    .map((r) => {
      const student = Array.isArray(r.students) ? r.students[0] : r.students;
      if (!student) return null;
      return {
        call_number: student.call_number,
        full_name: student.full_name,
        absence_reason: r.absence_reason || "",
        notes: r.notes || "",
      };
    })
    .filter((r): r is AbsenceReportRow => !!r)
    .sort((a, b) => a.call_number.localeCompare(b.call_number, "ar"));

  const defaults: AbsenceReportInitial = {
    reportTitle: "تقرير الغياب اليومي",
    madrasaName: settings?.madrasa_name || "",
    madrasaAddress: settings?.address || "",
    supervisorName: settings?.supervisor_name || "",
    phone: settings?.phone || "",
    logoUrl: settings?.logo_url || "",
    notes: "",
    rows: derivedRows,
  };

  const initial: AbsenceReportInitial = existing
    ? {
        reportTitle: existing.report_title,
        madrasaName: existing.madrasa_name_snapshot || "",
        madrasaAddress: existing.madrasa_address_snapshot || "",
        supervisorName: existing.supervisor_name_snapshot || "",
        phone: existing.phone_snapshot || "",
        logoUrl: existing.logo_snapshot || "",
        notes: existing.notes_snapshot || "",
        rows: (existing.extra_data as { rows?: AbsenceReportRow[] })?.rows || derivedRows,
      }
    : defaults;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">تقرير الغياب اليومي</h1>
      <AbsenceReportEditor
        reportDate={reportDate}
        initial={initial}
        defaults={defaults}
        hasExistingReport={!!existing}
      />
    </div>
  );
}
