import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { EmptyState, Input, Select, Badge } from "@/components/ui";
import { ReportRowActions } from "@/components/report-row-actions";
import { formatShortDate } from "@/lib/dates";

export const dynamic = "force-dynamic";
// "Regenerate PDF" launches a headless browser, which can take longer than
// the platform's default Server Action timeout, especially on a cold start.
export const maxDuration = 60;

const TYPE_LABELS: Record<string, string> = {
  student: "تقرير طالب",
  absence: "تقرير غياب",
  general: "تقرير عام",
};

export default async function ReportsArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; from?: string; to?: string }>;
}) {
  const { q = "", type = "all", from = "", to = "" } = await searchParams;
  const profile = await requireProfile();
  const supabase = await createClient();

  let query = supabase
    .from("daily_reports")
    .select("*")
    .order("report_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (type !== "all") query = query.eq("report_type", type);
  if (from) query = query.gte("report_date", from);
  if (to) query = query.lte("report_date", to);
  if (q) {
    query = query.or(
      `student_name_snapshot.ilike.%${q}%,call_number_snapshot.ilike.%${q}%,report_title.ilike.%${q}%`
    );
  }

  const { data: reports } = await query;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">أرشيف التقارير</h1>

      <form className="grid gap-3 sm:grid-cols-4" method="get">
        <Input name="q" defaultValue={q} placeholder="اسم الطالب أو الرقم..." className="sm:col-span-2" />
        <Select name="type" defaultValue={type}>
          <option value="all">كل الأنواع</option>
          <option value="student">تقرير طالب</option>
          <option value="absence">تقرير غياب</option>
          <option value="general">تقرير عام</option>
        </Select>
        <div className="flex gap-2">
          <Input type="date" name="from" defaultValue={from} />
          <Input type="date" name="to" defaultValue={to} />
        </div>
        <button className="col-span-full rounded-xl border-2 border-border py-2 text-sm font-bold sm:hidden">
          تصفية
        </button>
      </form>

      {!reports?.length ? (
        <EmptyState title="لا توجد تقارير" description="لم يتم العثور على أي تقرير مطابق للبحث." />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link href={`/reports/${r.id}`} className="font-black hover:underline">
                    {r.report_title}
                  </Link>
                  <p className="text-sm text-foreground/60">
                    {formatShortDate(r.report_date)}
                    {r.student_name_snapshot ? ` · ${r.student_name_snapshot}` : ""}
                  </p>
                </div>
                <Badge className="border-teal-300 bg-teal-100 text-teal-800 dark:border-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                  {TYPE_LABELS[r.report_type] || r.report_type}
                </Badge>
              </div>
              <ReportRowActions report={r} isAdmin={profile.role === "admin"} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
