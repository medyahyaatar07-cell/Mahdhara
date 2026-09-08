import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { Badge, Card, LinkButton } from "@/components/ui";
import { ATTENDANCE_LABELS, ATTENDANCE_COLORS, type AttendanceStatus } from "@/lib/types";
import { formatShortDate, todayISO } from "@/lib/dates";
import { StudentStatusToggle } from "@/components/student-status-toggle";
import { ReportRowActions } from "@/components/report-row-actions";
import { Pencil, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ data: student }, { data: attendance }, { data: reports }] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).single(),
    supabase
      .from("daily_attendance")
      .select("*")
      .eq("student_id", id)
      .order("date", { ascending: false })
      .limit(60),
    supabase
      .from("daily_reports")
      .select("*")
      .eq("student_id", id)
      .eq("report_type", "student")
      .order("report_date", { ascending: false })
      .limit(60),
  ]);

  if (!student) notFound();

  const presentDays = attendance?.filter((a) => a.status === "present").length || 0;
  const absentDays = attendance?.filter((a) => a.status === "absent").length || 0;
  const lateDays = attendance?.filter((a) => a.status === "late").length || 0;
  const lastAttendance = attendance?.[0];
  const lastReport = reports?.[0];

  const reportsByDate = new Map((reports || []).map((r) => [r.report_date, r]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">{student.full_name}</h1>
          <p className="text-sm text-foreground/60">
            الرقم بالنداء: {student.call_number}
            {student.level ? ` · ${student.level}` : ""}
          </p>
          {student.guardian_name && (
            <p className="text-sm text-foreground/50">ولي الأمر: {student.guardian_name}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={
              student.status === "active"
                ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "border-slate-300 bg-slate-100 text-slate-600"
            }
          >
            {student.status === "active" ? "نشط" : "غير نشط"}
          </Badge>
          <Link
            href={`/students/${id}/edit`}
            className="flex items-center gap-1 rounded-xl border-2 border-border px-3 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Pencil size={16} />
            تعديل
          </Link>
          <StudentStatusToggle studentId={id} status={student.status as "active" | "inactive"} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="أيام الحضور" value={presentDays} color="text-emerald-600" />
        <Stat label="أيام الغياب" value={absentDays} color="text-rose-600" />
        <Stat label="أيام التأخر" value={lateDays} color="text-amber-600" />
        <Stat label="عدد التقارير" value={reports?.length || 0} color="text-sky-600" />
        <Stat
          label="آخر حضور"
          value={lastAttendance ? formatShortDate(lastAttendance.date) : "—"}
          color="text-foreground"
        />
      </div>

      <div>
        <LinkButton href={`/reports/new/student/${id}?date=${todayISO()}`} size="sm">
          <FileText size={16} />
          إنشاء تقرير اليوم
        </LinkButton>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-black">السجل اليومي</h2>
        {!attendance?.length ? (
          <p className="text-sm text-foreground/50">لا يوجد سجل حضور بعد.</p>
        ) : (
          <div className="space-y-3">
            {attendance.map((a) => {
              const report = reportsByDate.get(a.date);
              const statusLabel = ATTENDANCE_LABELS[a.status as AttendanceStatus];
              return (
                <Card key={a.id} className="p-3 sm:p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black">{formatShortDate(a.date)}</span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                          ATTENDANCE_COLORS[a.status as AttendanceStatus]
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    {!report && (
                      <Link
                        href={`/reports/new/student/${id}?date=${a.date}`}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        إنشاء تقرير لهذا اليوم
                      </Link>
                    )}
                  </div>
                  {a.daily_achievement && (
                    <p className="mb-1 text-sm text-foreground/80">
                      <b className="text-foreground/50">المحصول: </b>
                      {a.daily_achievement}
                    </p>
                  )}
                  {a.notes && (
                    <p className="mb-2 text-sm text-foreground/60">
                      <b className="text-foreground/50">ملاحظات: </b>
                      {a.notes}
                    </p>
                  )}
                  {report && (
                    <ReportRowActions report={report} isAdmin={profile.role === "admin"} compact />
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="p-3 text-center">
      <p className={`text-xl font-black ${color}`}>{value}</p>
      <p className="mt-1 text-[11px] font-bold text-foreground/60">{label}</p>
    </Card>
  );
}
