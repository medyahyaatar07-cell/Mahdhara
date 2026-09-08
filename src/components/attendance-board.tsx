"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Save } from "lucide-react";
import { Button, Textarea, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { saveAttendanceDayAction, type AttendanceRowInput } from "@/app/(app)/attendance/actions";
import type { AttendanceStatus } from "@/lib/types";

export interface AttendanceStudent {
  id: string;
  call_number: string;
  full_name: string;
  level: string | null;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; activeClass: string }[] = [
  { value: "present", label: "حاضر", activeClass: "bg-emerald-600 text-white border-emerald-600" },
  { value: "absent", label: "غائب", activeClass: "bg-rose-600 text-white border-rose-600" },
  { value: "late", label: "متأخر", activeClass: "bg-amber-500 text-white border-amber-500" },
];

export function AttendanceBoard({
  date,
  students,
  initialRows,
}: {
  date: string;
  students: AttendanceStudent[];
  initialRows: Record<string, AttendanceRowInput>;
}) {
  const [rows, setRows] = useState<Record<string, AttendanceRowInput>>(() => {
    const map: Record<string, AttendanceRowInput> = {};
    for (const s of students) {
      map[s.id] = initialRows[s.id] || {
        student_id: s.id,
        status: "present",
        daily_achievement: "",
        absence_reason: "",
        notes: "",
      };
    }
    return map;
  });
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!query.trim()) return students;
    const qq = query.trim();
    return students.filter(
      (s) => s.full_name.includes(qq) || s.call_number.includes(qq)
    );
  }, [students, query]);

  function patch(studentId: string, patchObj: Partial<AttendanceRowInput>) {
    setRows((prev) => ({ ...prev, [studentId]: { ...prev[studentId], ...patchObj } }));
  }

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const res = await saveAttendanceDayAction(date, Object.values(rows));
      setMessage(res.error || "تم حفظ حضور اليوم بنجاح ✓");
    });
  }

  // Reports read attendance back from the database, so any unsaved change
  // on this screen must be persisted before navigating to a report —
  // otherwise the report would reflect stale (or empty) attendance data.
  function handleSaveAndGo(href: string) {
    setMessage(null);
    startTransition(async () => {
      const res = await saveAttendanceDayAction(date, Object.values(rows));
      if (res.error) {
        setMessage(res.error);
        return;
      }
      router.push(href);
    });
  }

  const summary = useMemo(() => {
    const values = Object.values(rows);
    return {
      present: values.filter((r) => r.status === "present").length,
      absent: values.filter((r) => r.status === "absent").length,
      late: values.filter((r) => r.status === "late").length,
    };
  }, [rows]);

  return (
    <div className="space-y-4 pb-20">
      <div className="sticky top-14 z-20 -mx-4 space-y-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-none sm:bg-transparent sm:px-0 sm:py-0">
        <Input
          placeholder="ابحث عن طالب..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-3 text-sm font-bold">
            <span className="text-emerald-600">حاضر: {summary.present}</span>
            <span className="text-rose-600">غائب: {summary.absent}</span>
            <span className="text-amber-600">متأخر: {summary.late}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => handleSaveAndGo(`/reports/new/general?date=${date}`)}
            >
              التقرير العام
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => handleSaveAndGo(`/reports/new/absence?date=${date}`)}
            >
              تقرير الغياب
            </Button>
            <Button onClick={handleSave} disabled={pending} size="sm">
              <Save size={16} />
              {pending ? "جارٍ الحفظ..." : "حفظ اليوم"}
            </Button>
          </div>
        </div>
        {message && (
          <p className="text-sm font-bold text-foreground/70">{message}</p>
        )}
      </div>

      <div className="space-y-3">
        {filtered.map((s) => {
          const row = rows[s.id];
          return (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-3 sm:p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="font-black">{s.full_name}</p>
                  <p className="text-xs text-foreground/50">
                    الرقم: {s.call_number}
                    {s.level ? ` · ${s.level}` : ""}
                  </p>
                </div>
                <Link
                  href={`/reports/new/student/${s.id}?date=${date}`}
                  className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <FileText size={14} />
                  تقرير
                </Link>
              </div>

              <div className="mb-2 grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => patch(s.id, { status: opt.value })}
                    className={cn(
                      "rounded-xl border-2 py-2.5 text-sm font-bold transition",
                      row.status === opt.value
                        ? opt.activeClass
                        : "border-border bg-transparent"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {row.status === "absent" && (
                <Input
                  className="mb-2"
                  placeholder="سبب الغياب (اختياري)"
                  value={row.absence_reason}
                  onChange={(e) => patch(s.id, { absence_reason: e.target.value })}
                />
              )}

              <Textarea
                className="mb-2"
                placeholder="المحصول اليومي: مثال: حفظ سورة الملك من الآية 1 إلى الآية 15"
                rows={2}
                value={row.daily_achievement}
                onChange={(e) => patch(s.id, { daily_achievement: e.target.value })}
              />
              <Input
                placeholder="ملاحظات المشرف (اختياري)"
                value={row.notes}
                onChange={(e) => patch(s.id, { notes: e.target.value })}
              />
            </div>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-16 z-20 flex justify-center px-4 sm:hidden">
        <Button onClick={handleSave} disabled={pending} size="lg" className="w-full max-w-sm shadow-lg">
          <Save size={18} />
          {pending ? "جارٍ الحفظ..." : "حفظ اليوم"}
        </Button>
      </div>
    </div>
  );
}
