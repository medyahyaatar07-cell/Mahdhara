import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { todayISO, isValidISODate, formatArabicDate } from "@/lib/dates";
import { AttendanceBoard } from "@/components/attendance-board";
import { EmptyState } from "@/components/ui";
import { DateFilter } from "@/components/date-filter";
import type { AttendanceRowInput } from "@/app/(app)/attendance/actions";

export const dynamic = "force-dynamic";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const selectedDate = date && isValidISODate(date) ? date : todayISO();

  const supabase = await createClient();
  const [{ data: students }, { data: attendance }] = await Promise.all([
    supabase
      .from("students")
      .select("id, call_number, full_name, level")
      .eq("status", "active")
      .order("call_number"),
    supabase.from("daily_attendance").select("*").eq("date", selectedDate),
  ]);

  const initialRows: Record<string, AttendanceRowInput> = {};
  for (const a of attendance || []) {
    initialRows[a.student_id] = {
      student_id: a.student_id,
      status: (a.status as AttendanceRowInput["status"]) || "present",
      daily_achievement: a.daily_achievement || "",
      absence_reason: a.absence_reason || "",
      notes: a.notes || "",
    };
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">الحضور اليومي</h1>
          <p className="text-sm text-foreground/50">{formatArabicDate(selectedDate)}</p>
        </div>
        <div className="flex items-center gap-2">
          <DateFilter date={selectedDate} />
        </div>
      </div>

      {!students?.length ? (
        <EmptyState
          title="لا يوجد طلاب نشطون"
          description="أضف طلابًا أولًا لتتمكن من تسجيل الحضور اليومي."
          action={<Link href="/students/new" className="font-bold text-primary underline">إضافة طالب</Link>}
        />
      ) : (
        <AttendanceBoard date={selectedDate} students={students} initialRows={initialRows} />
      )}
    </div>
  );
}
