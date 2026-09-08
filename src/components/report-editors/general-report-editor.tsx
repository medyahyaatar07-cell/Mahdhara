"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input, Select } from "@/components/ui";
import { GeneralReportPreview } from "@/components/report-preview";
import { saveGeneralReportAction } from "@/app/(app)/reports/actions";
import type { AttendanceStatus, GeneralReportRow } from "@/lib/types";

export interface GeneralReportInitial {
  reportTitle: string;
  madrasaName: string;
  madrasaAddress: string;
  supervisorName: string;
  phone: string;
  logoUrl: string;
  rows: GeneralReportRow[];
}

export function GeneralReportEditor({
  reportDate,
  initial,
  defaults,
  hasExistingReport,
}: {
  reportDate: string;
  initial: GeneralReportInitial;
  defaults: GeneralReportInitial;
  hasExistingReport: boolean;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const saveOnly = useMemo(
    () => saveGeneralReportAction.bind(null, reportDate, false),
    [reportDate]
  );
  const saveAndPdf = useMemo(
    () => saveGeneralReportAction.bind(null, reportDate, true),
    [reportDate]
  );

  function set<K extends keyof GeneralReportInitial>(key: K, val: GeneralReportInitial[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function setRow(index: number, patch: Partial<GeneralReportRow>) {
    setValues((v) => ({
      ...v,
      rows: v.rows.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));
  }

  function buildFormData() {
    const fd = new FormData();
    fd.set("report_title", values.reportTitle);
    fd.set("madrasa_name", values.madrasaName);
    fd.set("madrasa_address", values.madrasaAddress);
    fd.set("supervisor_name", values.supervisorName);
    fd.set("phone", values.phone);
    fd.set("logo_url", values.logoUrl);
    fd.set("rows_json", JSON.stringify(values.rows));
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
            يوجد تقرير عام محفوظ مسبقًا بهذا التاريخ. سيتم تحديثه عند الحفظ.
          </p>
        )}
        <Field label="عنوان التقرير">
          <Input value={values.reportTitle} onChange={(e) => set("reportTitle", e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم المحضرة">
            <Input value={values.madrasaName} onChange={(e) => set("madrasaName", e.target.value)} />
          </Field>
          <Field label="اسم المشرف">
            <Input value={values.supervisorName} onChange={(e) => set("supervisorName", e.target.value)} />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-foreground/80">
            جميع الطلاب ({values.rows.length})
          </p>
          <div className="max-h-[400px] space-y-2 overflow-y-auto pl-1">
            {values.rows.map((row, i) => (
              <div key={row.call_number} className="rounded-xl border border-border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-black">
                    {row.call_number} — {row.full_name}
                  </p>
                  <Select
                    className="!w-32"
                    value={row.status}
                    onChange={(e) => setRow(i, { status: e.target.value as AttendanceStatus })}
                  >
                    <option value="present">حاضر</option>
                    <option value="absent">غائب</option>
                    <option value="late">متأخر</option>
                  </Select>
                </div>
                <Input
                  placeholder="المحصول اليومي"
                  value={row.daily_achievement}
                  onChange={(e) => setRow(i, { daily_achievement: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>

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
          <Button variant="outline" onClick={() => setValues(defaults)} type="button">
            إعادة ضبط للقيم الافتراضية
          </Button>
          <Button variant="ghost" onClick={() => router.back()} type="button">
            إلغاء
          </Button>
        </div>
      </Card>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <p className="mb-2 text-center text-sm font-bold text-foreground/50">معاينة التقرير</p>
        <GeneralReportPreview
          logoUrl={values.logoUrl}
          madrasaName={values.madrasaName}
          address={values.madrasaAddress}
          phone={values.phone}
          supervisorName={values.supervisorName}
          title={values.reportTitle}
          date={reportDate}
          rows={values.rows}
        />
      </div>
    </div>
  );
}
