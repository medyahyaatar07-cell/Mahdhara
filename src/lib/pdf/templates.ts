import { formatArabicDate } from "@/lib/dates";

// Hosted on public Supabase Storage rather than embedded as base64: keeps the
// app bundle small while still guaranteeing correct Arabic joining/RTL shaping
// in the serverless Chromium environment, which ships without Arabic-capable
// system fonts. Puppeteer fetches this over the network before printing (see
// `document.fonts.ready` wait in generate.ts).
const NOTO_NASKH_ARABIC_URL =
  "https://bgfpxoplfrnuhteowirf.supabase.co/storage/v1/object/public/logos/fonts/NotoNaskhArabic-Subset.ttf";
import type { DailyReport } from "@/lib/types";
import type { GeneralReportRow, AbsenceReportRow } from "@/lib/types";

const ATTENDANCE_LABELS_AR: Record<string, string> = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
};

function esc(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function baseStyles(): string {
  return `
    @font-face {
      font-family: 'NotoNaskhArabic';
      src: url('${NOTO_NASKH_ARABIC_URL}') format('truetype');
      font-weight: 100 900;
      font-style: normal;
      font-display: block;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      direction: rtl;
      unicode-bidi: isolate;
    }
    body {
      font-family: 'NotoNaskhArabic', sans-serif;
      color: #111827;
      font-size: 15px;
      line-height: 1.9;
      background: #ffffff;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 14mm 16mm;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #0f766e;
      padding-bottom: 10px;
      margin-bottom: 18px;
    }
    .header .identity { display: flex; align-items: center; gap: 12px; }
    .header img.logo { height: 56px; width: 56px; object-fit: contain; border-radius: 10px; }
    .header .names { text-align: right; }
    .header .madrasa-name { font-size: 20px; font-weight: 700; font-family: 'NotoNaskhArabic'; margin: 0; }
    .header .meta { font-size: 12.5px; color: #4b5563; margin: 2px 0 0; }
    .title {
      text-align: center;
      font-family: 'NotoNaskhArabic';
      font-weight: 700;
      font-size: 19px;
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      border-radius: 10px;
      padding: 8px;
      margin-bottom: 16px;
      color: #0f766e;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 24px;
      margin-bottom: 16px;
      font-size: 14.5px;
    }
    .info-grid .item { display: flex; justify-content: space-between; border-bottom: 1px dashed #e5e7eb; padding-bottom: 4px;}
    .info-grid .item b { font-family: 'NotoNaskhArabic'; font-weight: 600; }
    .section { margin-bottom: 16px; }
    .section-title {
      font-family: 'NotoNaskhArabic';
      font-weight: 700;
      font-size: 14.5px;
      color: #0f766e;
      margin: 0 0 6px;
    }
    .box {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 10px 12px;
      min-height: 28px;
      white-space: pre-wrap;
      font-size: 14.5px;
    }
    .status-badge {
      display: inline-block;
      font-family: 'NotoNaskhArabic';
      font-weight: 700;
      padding: 5px 16px;
      border-radius: 999px;
      font-size: 14px;
    }
    .status-present { background: #d1fae5; color: #065f46; }
    .status-absent { background: #fee2e2; color: #991b1b; }
    .status-late { background: #fef3c7; color: #92400e; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border: 1px solid #e5e7eb; padding: 7px 8px; text-align: right; }
    th { background: #f0fdfa; font-family: 'NotoNaskhArabic'; font-weight: 700; color: #0f766e; }
    tbody tr:nth-child(even) { background: #fafafa; }
    .signature {
      margin-top: 32px;
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }
    .signature .line { margin-top: 30px; border-top: 1px solid #9ca3af; width: 220px; text-align: center; padding-top: 4px; }
    .footer-note { margin-top: 24px; font-size: 11px; color: #9ca3af; text-align: center; }
  `;
}

function htmlShell(title: string, body: string): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<style>${baseStyles()}</style>
</head>
<body>${body}</body>
</html>`;
}

function headerBlock(report: DailyReport): string {
  const showLogo = !!report.logo_snapshot;
  return `
  <div class="header">
    <div class="identity">
      ${showLogo ? `<img class="logo" src="${esc(report.logo_snapshot)}" />` : ""}
      <div class="names">
        <p class="madrasa-name">${esc(report.madrasa_name_snapshot || "محضرة")}</p>
        <p class="meta">
          ${report.madrasa_address_snapshot ? esc(report.madrasa_address_snapshot) : ""}
          ${report.phone_snapshot ? " · " + esc(report.phone_snapshot) : ""}
        </p>
      </div>
    </div>
    ${
      report.supervisor_name_snapshot
        ? `<div class="meta">المشرف: <b>${esc(report.supervisor_name_snapshot)}</b></div>`
        : ""
    }
  </div>`;
}

export function buildStudentReportHtml(report: DailyReport): string {
  const statusClass =
    report.attendance_status_snapshot === "present"
      ? "status-present"
      : report.attendance_status_snapshot === "late"
      ? "status-late"
      : "status-absent";
  const statusLabel = report.attendance_status_snapshot
    ? ATTENDANCE_LABELS_AR[report.attendance_status_snapshot] || report.attendance_status_snapshot
    : "—";

  const body = `
  <div class="page">
    ${headerBlock(report)}
    <div class="title">${esc(report.report_title)}</div>
    <div class="info-grid">
      <div class="item"><span>اسم الطالب</span><b>${esc(report.student_name_snapshot)}</b></div>
      <div class="item"><span>الرقم بالنداء</span><b>${esc(report.call_number_snapshot)}</b></div>
      <div class="item"><span>المستوى</span><b>${esc(report.level_snapshot) || "—"}</b></div>
      <div class="item"><span>التاريخ</span><b>${esc(formatArabicDate(report.report_date))}</b></div>
    </div>

    <div class="section">
      <p class="section-title">حالة الحضور</p>
      <span class="status-badge ${statusClass}">${statusLabel}</span>
    </div>

    <div class="section">
      <p class="section-title">المحصول اليومي</p>
      <div class="box">${esc(report.daily_achievement_snapshot) || "لم يتم إدخال المحصول اليومي."}</div>
    </div>

    <div class="section">
      <p class="section-title">الملاحظات</p>
      <div class="box">${esc(report.notes_snapshot) || "لا توجد ملاحظات."}</div>
    </div>

    <div class="signature">
      <div><div class="line">${esc(report.supervisor_name_snapshot) || ""}</div>اسم المشرف</div>
      <div><div class="line">&nbsp;</div>التوقيع</div>
    </div>
    <p class="footer-note">تم إنشاء هذا التقرير آليًا بواسطة نظام إدارة المحضرة</p>
  </div>`;

  return htmlShell(report.report_title, body);
}

export function buildAbsenceReportHtml(report: DailyReport): string {
  const rows = (report.extra_data as { rows?: AbsenceReportRow[] })?.rows || [];
  const body = `
  <div class="page">
    ${headerBlock(report)}
    <div class="title">${esc(report.report_title)}</div>
    <div class="info-grid">
      <div class="item"><span>التاريخ</span><b>${esc(formatArabicDate(report.report_date))}</b></div>
      <div class="item"><span>عدد الغائبين</span><b>${rows.length}</b></div>
    </div>
    <div class="section">
      <table>
        <thead>
          <tr><th>الرقم</th><th>اسم الطالب</th><th>سبب الغياب</th><th>ملاحظات</th></tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `<tr>
                <td>${esc(r.call_number)}</td>
                <td>${esc(r.full_name)}</td>
                <td>${esc(r.absence_reason) || "—"}</td>
                <td>${esc(r.notes) || "—"}</td>
              </tr>`
            )
            .join("")}
          ${
            rows.length === 0
              ? `<tr><td colspan="4" style="text-align:center;color:#9ca3af;">لا يوجد غائبون في هذا اليوم</td></tr>`
              : ""
          }
        </tbody>
      </table>
    </div>
    <div class="section">
      <p class="section-title">ملاحظات عامة</p>
      <div class="box">${esc(report.notes_snapshot) || "لا توجد ملاحظات."}</div>
    </div>
    <div class="signature">
      <div><div class="line">${esc(report.supervisor_name_snapshot) || ""}</div>اسم المشرف</div>
      <div><div class="line">&nbsp;</div>التوقيع</div>
    </div>
    <p class="footer-note">تم إنشاء هذا التقرير آليًا بواسطة نظام إدارة المحضرة</p>
  </div>`;
  return htmlShell(report.report_title, body);
}

export function buildGeneralReportHtml(report: DailyReport): string {
  const rows = (report.extra_data as { rows?: GeneralReportRow[] })?.rows || [];
  const present = rows.filter((r) => r.status === "present").length;
  const absent = rows.filter((r) => r.status === "absent").length;
  const late = rows.filter((r) => r.status === "late").length;

  const body = `
  <div class="page">
    ${headerBlock(report)}
    <div class="title">${esc(report.report_title)}</div>
    <div class="info-grid">
      <div class="item"><span>التاريخ</span><b>${esc(formatArabicDate(report.report_date))}</b></div>
      <div class="item"><span>إجمالي الطلاب</span><b>${rows.length}</b></div>
      <div class="item"><span>الحاضرون</span><b>${present}</b></div>
      <div class="item"><span>الغائبون / المتأخرون</span><b>${absent} / ${late}</b></div>
    </div>
    <div class="section">
      <table>
        <thead>
          <tr><th>الرقم</th><th>اسم الطالب</th><th>الحالة</th><th>المحصول اليومي</th></tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `<tr>
                <td>${esc(r.call_number)}</td>
                <td>${esc(r.full_name)}</td>
                <td>${esc(ATTENDANCE_LABELS_AR[r.status] || r.status)}</td>
                <td>${esc(r.daily_achievement) || "—"}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <div class="signature">
      <div><div class="line">${esc(report.supervisor_name_snapshot) || ""}</div>اسم المشرف</div>
      <div><div class="line">&nbsp;</div>التوقيع</div>
    </div>
    <p class="footer-note">تم إنشاء هذا التقرير آليًا بواسطة نظام إدارة المحضرة</p>
  </div>`;
  return htmlShell(report.report_title, body);
}

export function buildReportHtml(report: DailyReport): string {
  if (report.report_type === "absence") return buildAbsenceReportHtml(report);
  if (report.report_type === "general") return buildGeneralReportHtml(report);
  return buildStudentReportHtml(report);
}
