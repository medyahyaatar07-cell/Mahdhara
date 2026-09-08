import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import {
  StudentReportPreview,
  AbsenceReportPreview,
  GeneralReportPreview,
} from "@/components/report-preview";
import { ReportRowActions } from "@/components/report-row-actions";
import type { AbsenceReportRow, AttendanceStatus, GeneralReportRow } from "@/lib/types";

export const dynamic = "force-dynamic";
// "Regenerate PDF" launches a headless browser, which can take longer than
// the platform's default Server Action timeout, especially on a cold start.
export const maxDuration = 60;

export default async function ReportViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data: report } = await supabase
    .from("daily_reports")
    .select("*")
    .eq("id", id)
    .single();

  if (!report) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">{report.report_title}</h1>
        <ReportRowActions report={report} isAdmin={profile.role === "admin"} />
      </div>

      {report.report_type === "student" && (
        <StudentReportPreview
          logoUrl={report.logo_snapshot}
          madrasaName={report.madrasa_name_snapshot || ""}
          address={report.madrasa_address_snapshot || ""}
          phone={report.phone_snapshot || ""}
          supervisorName={report.supervisor_name_snapshot || ""}
          title={report.report_title}
          studentName={report.student_name_snapshot || ""}
          callNumber={report.call_number_snapshot || ""}
          level={report.level_snapshot || ""}
          date={report.report_date}
          status={(report.attendance_status_snapshot as AttendanceStatus) || "present"}
          achievement={report.daily_achievement_snapshot || ""}
          notes={report.notes_snapshot || ""}
        />
      )}

      {report.report_type === "absence" && (
        <AbsenceReportPreview
          logoUrl={report.logo_snapshot}
          madrasaName={report.madrasa_name_snapshot || ""}
          address={report.madrasa_address_snapshot || ""}
          phone={report.phone_snapshot || ""}
          supervisorName={report.supervisor_name_snapshot || ""}
          title={report.report_title}
          date={report.report_date}
          rows={(report.extra_data as { rows?: AbsenceReportRow[] })?.rows || []}
          notes={report.notes_snapshot || ""}
        />
      )}

      {report.report_type === "general" && (
        <GeneralReportPreview
          logoUrl={report.logo_snapshot}
          madrasaName={report.madrasa_name_snapshot || ""}
          address={report.madrasa_address_snapshot || ""}
          phone={report.phone_snapshot || ""}
          supervisorName={report.supervisor_name_snapshot || ""}
          title={report.report_title}
          date={report.report_date}
          rows={(report.extra_data as { rows?: GeneralReportRow[] })?.rows || []}
        />
      )}

      {!report.pdf_path && (
        <p className="text-center text-sm text-foreground/50">
          لم يتم إنشاء ملف PDF لهذا التقرير بعد. اضغط &quot;إعادة إنشاء PDF&quot; لإنشائه.
        </p>
      )}
    </div>
  );
}
