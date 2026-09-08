import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { DailyReport } from "@/lib/types";
import { buildReportHtml } from "@/lib/pdf/templates";
import { launchBrowser } from "@/lib/pdf/browser";
import { reportStoragePath } from "@/lib/pdf/filename";

async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    // The Arabic font is fetched from a remote URL (see templates.ts) rather
    // than embedded, so explicitly wait for it to finish downloading and
    // becoming active before printing — otherwise Chromium may fall back to
    // a font with no Arabic shaping support and render disjointed letters.
    await page
      .evaluate(() => (document as Document).fonts.ready.then(() => undefined))
      .catch(() => undefined);
    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

/**
 * Renders the given report to PDF and uploads it to the private "reports"
 * storage bucket, then stores the storage path + a fresh signed URL on the
 * report row. Returns the updated report.
 */
export async function generateAndStoreReportPdf(
  supabase: SupabaseClient<Database>,
  report: DailyReport
): Promise<DailyReport> {
  const html = buildReportHtml(report);
  const pdfBuffer = await renderHtmlToPdf(html);
  const path = reportStoragePath(report);

  const { error: uploadError } = await supabase.storage
    .from("reports")
    .upload(path, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    throw new Error("فشل رفع ملف PDF: " + uploadError.message);
  }

  const { data: signed } = await supabase.storage
    .from("reports")
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  const { data: updated, error: updateError } = await supabase
    .from("daily_reports")
    .update({ pdf_path: path, pdf_url: signed?.signedUrl ?? null })
    .eq("id", report.id)
    .select("*")
    .single();

  if (updateError || !updated) {
    throw new Error("فشل تحديث سجل التقرير بعد إنشاء PDF");
  }

  return updated;
}
