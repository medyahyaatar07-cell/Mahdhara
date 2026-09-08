import { createClient } from "@/lib/supabase/server";
import { todayISO, formatArabicDate } from "@/lib/dates";
import { Card, LinkButton } from "@/components/ui";
import {
  ClipboardCheck,
  UserPlus,
  Users,
  Archive,
  BarChart3,
  FileWarning,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = todayISO();

  const [{ count: activeCount }, { data: attendanceRows }, { count: reportsToday }] =
    await Promise.all([
      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("daily_attendance")
        .select("status")
        .eq("date", today),
      supabase
        .from("daily_reports")
        .select("id", { count: "exact", head: true })
        .eq("report_date", today)
        .eq("report_type", "student"),
    ]);

  const total = activeCount || 0;
  const present = attendanceRows?.filter((r) => r.status === "present").length || 0;
  const absent = attendanceRows?.filter((r) => r.status === "absent").length || 0;
  const late = attendanceRows?.filter((r) => r.status === "late").length || 0;
  const recorded = attendanceRows?.length || 0;
  const notRecorded = Math.max(total - recorded, 0);
  const withoutReport = Math.max(total - (reportsToday || 0), 0);

  const presentPct = total ? Math.round(((present + late) / total) * 100) : 0;
  const absentPct = total ? Math.round((absent / total) * 100) : 0;

  const stats = [
    { label: "الطلاب النشطون", value: total, color: "text-slate-900 dark:text-slate-100" },
    { label: "الحاضرون", value: present, color: "text-emerald-600" },
    { label: "الغائبون", value: absent, color: "text-rose-600" },
    { label: "المتأخرون", value: late, color: "text-amber-600" },
    { label: "لم يُسجَّل لهم", value: notRecorded, color: "text-slate-500" },
    { label: "بلا تقرير اليوم", value: withoutReport, color: "text-sky-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold text-foreground/50">
          {formatArabicDate(today)}
        </p>
        <h1 className="text-2xl font-black">لوحة التحكم</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs font-bold text-foreground/60">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-bold text-foreground/50">نسبة الحضور</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{presentPct}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold text-foreground/50">نسبة الغياب</p>
          <p className="mt-1 text-2xl font-black text-rose-600">{absentPct}%</p>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-black">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <QuickAction href="/students/new" icon={UserPlus} label="إضافة طالب" />
          <QuickAction href="/attendance" icon={ClipboardCheck} label="الحضور اليومي" />
          <QuickAction href="/reports/new/general" icon={FileWarning} label="التقرير العام" />
          <QuickAction href="/students" icon={Users} label="قائمة الطلاب" />
          <QuickAction href="/reports/archive" icon={Archive} label="أرشيف التقارير" />
          <QuickAction href="/statistics" icon={BarChart3} label="الإحصائيات" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}) {
  return (
    <LinkButton
      href={href}
      variant="outline"
      className="h-24 flex-col gap-2 !rounded-2xl"
    >
      <Icon size={24} />
      <span className="text-sm">{label}</span>
    </LinkButton>
  );
}
