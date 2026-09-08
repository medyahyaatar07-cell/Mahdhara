import { createClient } from "@/lib/supabase/server";
import { todayISO, nowInMadrasa, isValidISODate, formatShortDate } from "@/lib/dates";
import { Card, Input } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Period = "day" | "week" | "month" | "custom";

function rangeFor(period: Period, from?: string, to?: string) {
  const today = nowInMadrasa();
  if (period === "day") {
    const d = today.format("YYYY-MM-DD");
    return { from: d, to: d };
  }
  if (period === "week") {
    return { from: today.subtract(6, "day").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
  }
  if (period === "month") {
    return { from: today.subtract(29, "day").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
  }
  return {
    from: from && isValidISODate(from) ? from : today.format("YYYY-MM-DD"),
    to: to && isValidISODate(to) ? to : today.format("YYYY-MM-DD"),
  };
}

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const { period: periodParam, from, to } = await searchParams;
  const period = (["day", "week", "month", "custom"].includes(periodParam || "")
    ? periodParam
    : "week") as Period;
  const { from: rangeFrom, to: rangeTo } = rangeFor(period, from, to);

  const supabase = await createClient();
  const [{ data: attendance }, { count: reportsCount }] = await Promise.all([
    supabase
      .from("daily_attendance")
      .select("student_id, status, date, students(full_name, call_number)")
      .gte("date", rangeFrom)
      .lte("date", rangeTo),
    supabase
      .from("daily_reports")
      .select("id", { count: "exact", head: true })
      .gte("report_date", rangeFrom)
      .lte("report_date", rangeTo),
  ]);

  const rows = attendance || [];
  const present = rows.filter((r) => r.status === "present").length;
  const absent = rows.filter((r) => r.status === "absent").length;
  const late = rows.filter((r) => r.status === "late").length;
  const total = rows.length || 1;
  const presentPct = Math.round(((present + late) / total) * 100);
  const absentPct = Math.round((absent / total) * 100);

  const byStudent = new Map<
    string,
    { name: string; call_number: string; present: number; absent: number }
  >();
  for (const r of rows) {
    const student = Array.isArray(r.students) ? r.students[0] : r.students;
    if (!student) continue;
    const key = r.student_id;
    if (!byStudent.has(key)) {
      byStudent.set(key, { name: student.full_name, call_number: student.call_number, present: 0, absent: 0 });
    }
    const entry = byStudent.get(key)!;
    if (r.status === "present" || r.status === "late") entry.present += 1;
    if (r.status === "absent") entry.absent += 1;
  }

  const mostPresent = [...byStudent.values()].sort((a, b) => b.present - a.present).slice(0, 5);
  const mostAbsent = [...byStudent.values()]
    .filter((s) => s.absent > 0)
    .sort((a, b) => b.absent - a.absent)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">الإحصائيات</h1>

      <div className="flex flex-wrap items-center gap-2">
        <PeriodLink period="day" current={period} label="اليوم" />
        <PeriodLink period="week" current={period} label="الأسبوع" />
        <PeriodLink period="month" current={period} label="الشهر" />
        <PeriodLink period="custom" current={period} label="فترة مخصصة" />
        {period === "custom" && (
          <form method="get" className="flex items-center gap-2">
            <input type="hidden" name="period" value="custom" />
            <Input type="date" name="from" defaultValue={rangeFrom} />
            <span>إلى</span>
            <Input type="date" name="to" defaultValue={rangeTo} />
            <button className="rounded-xl border-2 border-border px-3 py-2 text-sm font-bold">
              تطبيق
            </button>
          </form>
        )}
      </div>

      <p className="text-sm text-foreground/50">
        {formatShortDate(rangeFrom)} — {formatShortDate(rangeTo)}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="حضور" value={present} color="text-emerald-600" />
        <Stat label="غياب" value={absent} color="text-rose-600" />
        <Stat label="تأخر" value={late} color="text-amber-600" />
        <Stat label="تقارير مُنشأة" value={reportsCount ?? 0} color="text-sky-600" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="نسبة الحضور" value={`${presentPct}%`} color="text-emerald-600" />
        <Stat label="نسبة الغياب" value={`${absentPct}%`} color="text-rose-600" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 font-black">أكثر الطلاب حضورًا</h2>
          <div className="space-y-2">
            {mostPresent.length === 0 && <p className="text-sm text-foreground/50">لا توجد بيانات</p>}
            {mostPresent.map((s) => (
              <Card key={s.call_number} className="flex items-center justify-between p-3 text-sm">
                <span className="font-bold">{s.name}</span>
                <span className="text-emerald-600 font-black">{s.present}</span>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-2 font-black">غياب متكرر</h2>
          <div className="space-y-2">
            {mostAbsent.length === 0 && <p className="text-sm text-foreground/50">لا توجد بيانات</p>}
            {mostAbsent.map((s) => (
              <Card key={s.call_number} className="flex items-center justify-between p-3 text-sm">
                <span className="font-bold">{s.name}</span>
                <span className="text-rose-600 font-black">{s.absent}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <Card className="p-4 text-center">
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="mt-1 text-xs font-bold text-foreground/60">{label}</p>
    </Card>
  );
}

function PeriodLink({
  period,
  current,
  label,
}: {
  period: Period;
  current: Period;
  label: string;
}) {
  const active = period === current;
  return (
    <Link
      href={`/statistics?period=${period}`}
      className={`rounded-xl border-2 px-3 py-2 text-sm font-bold ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border"
      }`}
    >
      {label}
    </Link>
  );
}
