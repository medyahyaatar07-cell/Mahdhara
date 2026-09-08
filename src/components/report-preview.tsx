import { ATTENDANCE_LABELS, ATTENDANCE_COLORS } from "@/lib/types";
import type { AttendanceStatus, GeneralReportRow, AbsenceReportRow } from "@/lib/types";
import { formatArabicDate } from "@/lib/dates";

function PreviewShell({
  logoUrl,
  madrasaName,
  address,
  phone,
  supervisorName,
  title,
  children,
}: {
  logoUrl?: string | null;
  madrasaName: string;
  address?: string;
  phone?: string;
  supervisorName?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="mx-auto w-full max-w-[560px] rounded-2xl border border-border bg-white p-5 text-slate-900 shadow-inner sm:p-7"
      style={{ fontFamily: "var(--font-cairo), sans-serif" }}
      dir="rtl"
    >
      <div className="mb-4 flex items-center justify-between border-b-4 border-teal-700 pb-3">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-12 w-12 rounded-lg object-contain" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-700 text-lg font-black text-white">
              م
            </div>
          )}
          <div>
            <p className="text-lg font-black">{madrasaName || "محضرة"}</p>
            <p className="text-xs text-slate-500">
              {[address, phone].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        {supervisorName && (
          <p className="text-xs text-slate-500">
            المشرف: <b className="text-slate-800">{supervisorName}</b>
          </p>
        )}
      </div>
      <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 py-2 text-center text-base font-black text-teal-800">
        {title}
      </div>
      {children}
      <p className="mt-6 text-center text-[10px] text-slate-400">
        تم إنشاء هذا التقرير آليًا بواسطة نظام إدارة المحضرة
      </p>
    </div>
  );
}

export function StudentReportPreview({
  logoUrl,
  madrasaName,
  address,
  phone,
  supervisorName,
  title,
  studentName,
  callNumber,
  level,
  date,
  status,
  achievement,
  notes,
}: {
  logoUrl?: string | null;
  madrasaName: string;
  address?: string;
  phone?: string;
  supervisorName?: string;
  title: string;
  studentName: string;
  callNumber: string;
  level?: string;
  date: string;
  status: AttendanceStatus;
  achievement: string;
  notes: string;
}) {
  return (
    <PreviewShell
      logoUrl={logoUrl}
      madrasaName={madrasaName}
      address={address}
      phone={phone}
      supervisorName={supervisorName}
      title={title}
    >
      <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        <Row label="اسم الطالب" value={studentName} />
        <Row label="الرقم بالنداء" value={callNumber} />
        <Row label="المستوى" value={level || "—"} />
        <Row label="التاريخ" value={formatArabicDate(date)} />
      </div>
      <Section title="حالة الحضور">
        <span
          className={`inline-block rounded-full border px-4 py-1 text-sm font-bold ${ATTENDANCE_COLORS[status]}`}
        >
          {ATTENDANCE_LABELS[status]}
        </span>
      </Section>
      <Section title="المحصول اليومي">
        <Box>{achievement || "لم يتم إدخال المحصول اليومي."}</Box>
      </Section>
      <Section title="الملاحظات">
        <Box>{notes || "لا توجد ملاحظات."}</Box>
      </Section>
      <Signature supervisorName={supervisorName} />
    </PreviewShell>
  );
}

export function AbsenceReportPreview({
  logoUrl,
  madrasaName,
  address,
  phone,
  supervisorName,
  title,
  date,
  rows,
  notes,
}: {
  logoUrl?: string | null;
  madrasaName: string;
  address?: string;
  phone?: string;
  supervisorName?: string;
  title: string;
  date: string;
  rows: AbsenceReportRow[];
  notes: string;
}) {
  return (
    <PreviewShell
      logoUrl={logoUrl}
      madrasaName={madrasaName}
      address={address}
      phone={phone}
      supervisorName={supervisorName}
      title={title}
    >
      <div className="mb-4 flex justify-between text-sm">
        <Row label="التاريخ" value={formatArabicDate(date)} />
        <Row label="عدد الغائبين" value={String(rows.length)} />
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-teal-50 text-teal-800">
            <tr>
              <th className="p-2">الرقم</th>
              <th className="p-2">اسم الطالب</th>
              <th className="p-2">سبب الغياب</th>
              <th className="p-2">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="p-3 text-center text-slate-400">
                  لا يوجد غائبون
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.call_number} className="border-t border-slate-100">
                <td className="p-2 text-center">{r.call_number}</td>
                <td className="p-2">{r.full_name}</td>
                <td className="p-2">{r.absence_reason || "—"}</td>
                <td className="p-2">{r.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Section title="ملاحظات عامة">
        <Box>{notes || "لا توجد ملاحظات."}</Box>
      </Section>
      <Signature supervisorName={supervisorName} />
    </PreviewShell>
  );
}

export function GeneralReportPreview({
  logoUrl,
  madrasaName,
  address,
  phone,
  supervisorName,
  title,
  date,
  rows,
}: {
  logoUrl?: string | null;
  madrasaName: string;
  address?: string;
  phone?: string;
  supervisorName?: string;
  title: string;
  date: string;
  rows: GeneralReportRow[];
}) {
  return (
    <PreviewShell
      logoUrl={logoUrl}
      madrasaName={madrasaName}
      address={address}
      phone={phone}
      supervisorName={supervisorName}
      title={title}
    >
      <div className="mb-4 flex justify-between text-sm">
        <Row label="التاريخ" value={formatArabicDate(date)} />
        <Row label="إجمالي الطلاب" value={String(rows.length)} />
      </div>
      <div className="max-h-[380px] overflow-y-auto overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-teal-50 text-teal-800">
            <tr>
              <th className="p-2">الرقم</th>
              <th className="p-2">اسم الطالب</th>
              <th className="p-2">الحالة</th>
              <th className="p-2">المحصول اليومي</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.call_number} className="border-t border-slate-100">
                <td className="p-2 text-center">{r.call_number}</td>
                <td className="p-2">{r.full_name}</td>
                <td className="p-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${ATTENDANCE_COLORS[r.status]}`}
                  >
                    {ATTENDANCE_LABELS[r.status]}
                  </span>
                </td>
                <td className="p-2">{r.daily_achievement || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Signature supervisorName={supervisorName} />
    </PreviewShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
      <span className="text-slate-500">{label}</span>
      <b>{value}</b>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="mb-1 text-xs font-black text-teal-700">{title}</p>
      {children}
    </div>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[32px] whitespace-pre-wrap rounded-lg border border-slate-200 px-3 py-2 text-sm">
      {children}
    </div>
  );
}

function Signature({ supervisorName }: { supervisorName?: string }) {
  return (
    <div className="mt-8 flex justify-between text-xs text-slate-600">
      <div className="text-center">
        <div className="mb-1 h-8">{supervisorName}</div>
        <div className="w-28 border-t border-slate-400 pt-1">اسم المشرف</div>
      </div>
      <div className="text-center">
        <div className="mb-1 h-8" />
        <div className="w-28 border-t border-slate-400 pt-1">التوقيع</div>
      </div>
    </div>
  );
}
