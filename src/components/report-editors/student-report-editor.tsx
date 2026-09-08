"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { StudentReportPreview } from "@/components/report-preview";
import { saveStudentReportAction } from "@/app/(app)/reports/actions";
import type { AttendanceStatus } from "@/lib/types";

export interface StudentReportInitial {
  reportTitle: string;
  madrasaName: string;
  madrasaAddress: string;
  supervisorName: string;
  phone: string;
  logoUrl: string;
  studentName: string;
  callNumber: string;
  level: string;
  attendanceStatus: AttendanceStatus;
  dailyAchievement: string;
  notes: string;
}

export function StudentReportEditor({
  studentId,
  reportDate,
  initial,
  defaults,
  hasExistingReport,
}: {
  studentId: string;
  reportDate: string;
  initial: StudentReportInitial;
  defaults: StudentReportInitial;
  hasExistingReport: boolean;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const saveOnly = useMemo(
    () => saveStudentReportAction.bind(null, studentId, reportDate, false),
    [studentId, reportDate]
  );
  const saveAndPdf = useMemo(
    () => saveStudentReportAction.bind(null, studentId, reportDate, true),
    [studentId, reportDate]
  );

  function set<K extends keyof StudentReportInitial>(key: K, val: StudentReportInitial[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function buildFormData() {
    const fd = new FormData();
    fd.set("report_title", values.reportTitle);
    fd.set("madrasa_name", values.madrasaName);
    fd.set("madrasa_address", values.madrasaAddress);
    fd.set("supervisor_name", values.supervisorName);
    fd.set("phone", values.phone);
    fd.set("logo_url", values.logoUrl);
    fd.set("student_name", values.studentName);
    fd.set("call_number", values.callNumber);
    fd.set("level", values.level);
    fd.set("attendance_status", values.attendanceStatus);
    fd.set("daily_achievement", values.dailyAchievement);
    fd.set("notes", values.notes);
    return fd;
  }

  function handleSave(generatePdf: boolean) {
    setError(null);
    startTransition(async () => {
      const action = generatePdf ? saveAndPdf : saveOnly;
      const res = await action(null, buildFormData());
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4 p-4 sm:p-6">
        {hasExistingReport && (
          <p className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            يوجد تقرير محفوظ مسبقًا لهذا الطالب بهذا التاريخ. أي حفظ سيقوم بتحديثه بدلًا من إنشاء تقرير مكرر.
          </p>
        )}
        <Field label="عنوان التقرير">
          <Input value={values.reportTitle} onChange={(e) => set("reportTitle", e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم المحضرة" hint="قيمة ثابتة، يمكن تغييرها من الإعدادات">
            <p className="rounded-lg border border-border bg-black/5 px-3 py-2 text-sm text-foreground/80 dark:bg-white/5">
              {values.madrasaName || (
                <span className="text-foreground/40">غير محدد — اضبطه من الإعدادات</span>
              )}
            </p>
          </Field>
          <Field label="العنوان">
            <Input value={values.madrasaAddress} onChange={(e) => set("madrasaAddress", e.target.value)} />
          </Field>
          <Field label="اسم المشرف" hint="قيمة ثابتة، يمكن تغييرها من الإعدادات">
            <p className="rounded-lg border border-border bg-black/5 px-3 py-2 text-sm text-foreground/80 dark:bg-white/5">
              {values.supervisorName || (
                <span className="text-foreground/40">غير محدد — اضبطه من الإعدادات</span>
              )}
            </p>
          </Field>
          <Field label="رقم الهاتف" hint="قيمة ثابتة، يمكن تغييرها من الإعدادات">
            <p dir="ltr" className="rounded-lg border border-border bg-black/5 px-3 py-2 text-left text-sm text-foreground/80 dark:bg-white/5">
              {values.phone || (
                <span className="text-foreground/40">غير محدد</span>
              )}
            </p>
          </Field>
        </div>

        <hr className="border-border" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم الطالب">
            <Input value={values.studentName} onChange={(e) => set("studentName", e.target.value)} />
          </Field>
          <Field label="الرقم بالنداء">
            <Input value={values.callNumber} onChange={(e) => set("callNumber", e.target.value)} />
          </Field>
          <Field label="المستوى">
            <Input value={values.level} onChange={(e) => set("level", e.target.value)} />
          </Field>
          <Field label="حالة الحضور">
            <Select
              value={values.attendanceStatus}
              onChange={(e) => set("attendanceStatus", e.target.value as AttendanceStatus)}
            >
              <option value="present">حاضر</option>
              <option value="absent">غائب</option>
              <option value="late">متأخر</option>
            </Select>
          </Field>
        </div>

        <Field label="المحصول اليومي" hint="مأخوذ من صفحة الحضور — لتعديله عُد إلى صفحة الحضور">
          <p className="min-h-[3.5rem] whitespace-pre-wrap rounded-lg border border-border bg-black/5 px-3 py-2 text-sm text-foreground/80 dark:bg-white/5">
            {values.dailyAchievement || (
              <span className="text-foreground/40">
                لم يُسجَّل محصول يومي لهذا الطالب في الحضور
              </span>
            )}
          </p>
        </Field>
        <Field label="الملاحظات">
          <Textarea rows={3} value={values.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>

        {values.attendanceStatus === "present" && !values.dailyAchievement.trim() && (
          <p className="rounded-xl bg-sky-100 px-3 py-2 text-sm font-bold text-sky-800 dark:bg-sky-900/30 dark:text-sky-300">
            تنبيه: لم يتم تسجيل محصول يومي لهذا الطالب في صفحة الحضور. عُد إلى صفحة الحضور لإضافته.
          </p>
        )}
        {error && (
          <p className="rounded-xl bg-rose-100 px-3 py-2 text-sm font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={() => handleSave(true)} disabled={pending} size="lg">
            {pending ? "جارٍ الحفظ..." : "اعتماد وإنشاء PDF"}
          </Button>
          <Button variant="secondary" onClick={() => handleSave(false)} disabled={pending}>
            حفظ فقط
          </Button>
          <Button variant="outline" onClick={() => setValues(defaults)} disabled={pending} type="button">
            إعادة ضبط للقيم الافتراضية
          </Button>
          <Button variant="ghost" onClick={() => router.back()} type="button">
            إلغاء
          </Button>
        </div>
      </Card>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <p className="mb-2 text-center text-sm font-bold text-foreground/50">معاينة التقرير</p>
        <StudentReportPreview
          logoUrl={values.logoUrl}
          madrasaName={values.madrasaName}
          address={values.madrasaAddress}
          phone={values.phone}
          supervisorName={values.supervisorName}
          title={values.reportTitle}
          studentName={values.studentName}
          callNumber={values.callNumber}
          level={values.level}
          date={reportDate}
          status={values.attendanceStatus}
          achievement={values.dailyAchievement}
          notes={values.notes}
        />
      </div>
    </div>
  );
}
