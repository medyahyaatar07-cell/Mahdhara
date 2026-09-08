"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireProfile } from "@/lib/auth";
import { generateAndStoreReportPdf } from "@/lib/pdf/generate";
import type { GeneralReportRow, AbsenceReportRow } from "@/lib/types";

export type ReportFormState = { error?: string; success?: boolean } | null;

async function getSettingsSnapshot() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("madrasa_settings")
    .select("*")
    .eq("id", 1)
    .single();
  return data;
}

/** Student daily report: create-or-update (unique per student+date), then optionally render PDF. */
export async function saveStudentReportAction(
  studentId: string,
  reportDate: string,
  generatePdf: boolean,
  _prev: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .single();
  if (!student) return { error: "الطالب غير موجود" };

  const payload = {
    report_type: "student" as const,
    student_id: studentId,
    report_date: reportDate,
    report_title: String(formData.get("report_title") || "التقرير اليومي للطالب"),
    madrasa_name_snapshot: String(formData.get("madrasa_name") || ""),
    madrasa_address_snapshot: String(formData.get("madrasa_address") || ""),
    supervisor_name_snapshot: String(formData.get("supervisor_name") || ""),
    phone_snapshot: String(formData.get("phone") || ""),
    logo_snapshot: String(formData.get("logo_url") || "") || null,
    student_name_snapshot: String(formData.get("student_name") || student.full_name),
    call_number_snapshot: String(formData.get("call_number") || student.call_number),
    level_snapshot: String(formData.get("level") || student.level || ""),
    attendance_status_snapshot: String(formData.get("attendance_status") || "present"),
    daily_achievement_snapshot: String(formData.get("daily_achievement") || ""),
    notes_snapshot: String(formData.get("notes") || ""),
    updated_by: profile.id,
  };

  const { data: existing } = await supabase
    .from("daily_reports")
    .select("id")
    .eq("student_id", studentId)
    .eq("report_date", reportDate)
    .eq("report_type", "student")
    .maybeSingle();

  let reportId: string;
  if (existing) {
    const { error } = await supabase
      .from("daily_reports")
      .update(payload)
      .eq("id", existing.id);
    if (error) return { error: "فشل حفظ التقرير: " + error.message };
    reportId = existing.id;
  } else {
    const { data: created, error } = await supabase
      .from("daily_reports")
      .insert({ ...payload, created_by: profile.id })
      .select("id")
      .single();
    if (error) return { error: "فشل حفظ التقرير: " + error.message };
    reportId = created.id;
  }

  if (generatePdf) {
    const { data: fullReport } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("id", reportId)
      .single();
    if (fullReport) {
      try {
        await generateAndStoreReportPdf(supabase, fullReport);
      } catch (e) {
        return { error: e instanceof Error ? e.message : "فشل إنشاء PDF" };
      }
    }
  }

  revalidatePath(`/students/${studentId}`);
  revalidatePath("/reports/archive");
  redirect(`/reports/${reportId}`);
}

export async function saveAbsenceReportAction(
  reportDate: string,
  generatePdf: boolean,
  _prev: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const rowsJson = String(formData.get("rows_json") || "[]");
  let rows: AbsenceReportRow[] = [];
  try {
    rows = JSON.parse(rowsJson);
  } catch {
    return { error: "بيانات غير صالحة" };
  }

  const payload = {
    report_type: "absence" as const,
    student_id: null,
    report_date: reportDate,
    report_title: String(formData.get("report_title") || "تقرير الغياب اليومي"),
    madrasa_name_snapshot: String(formData.get("madrasa_name") || ""),
    madrasa_address_snapshot: String(formData.get("madrasa_address") || ""),
    supervisor_name_snapshot: String(formData.get("supervisor_name") || ""),
    phone_snapshot: String(formData.get("phone") || ""),
    logo_snapshot: String(formData.get("logo_url") || "") || null,
    notes_snapshot: String(formData.get("notes") || ""),
    extra_data: JSON.parse(JSON.stringify({ rows })),
    updated_by: profile.id,
  };

  const { data: existing } = await supabase
    .from("daily_reports")
    .select("id")
    .eq("report_date", reportDate)
    .eq("report_type", "absence")
    .maybeSingle();

  let reportId: string;
  if (existing) {
    const { error } = await supabase
      .from("daily_reports")
      .update(payload)
      .eq("id", existing.id);
    if (error) return { error: "فشل حفظ التقرير: " + error.message };
    reportId = existing.id;
  } else {
    const { data: created, error } = await supabase
      .from("daily_reports")
      .insert({ ...payload, created_by: profile.id })
      .select("id")
      .single();
    if (error) return { error: "فشل حفظ التقرير: " + error.message };
    reportId = created.id;
  }

  if (generatePdf) {
    const { data: fullReport } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("id", reportId)
      .single();
    if (fullReport) {
      try {
        await generateAndStoreReportPdf(supabase, fullReport);
      } catch (e) {
        return { error: e instanceof Error ? e.message : "فشل إنشاء PDF" };
      }
    }
  }

  revalidatePath("/reports/archive");
  redirect(`/reports/${reportId}`);
}

export async function saveGeneralReportAction(
  reportDate: string,
  generatePdf: boolean,
  _prev: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const rowsJson = String(formData.get("rows_json") || "[]");
  let rows: GeneralReportRow[] = [];
  try {
    rows = JSON.parse(rowsJson);
  } catch {
    return { error: "بيانات غير صالحة" };
  }

  const payload = {
    report_type: "general" as const,
    student_id: null,
    report_date: reportDate,
    report_title: String(formData.get("report_title") || "التقرير اليومي للمحضرة"),
    madrasa_name_snapshot: String(formData.get("madrasa_name") || ""),
    madrasa_address_snapshot: String(formData.get("madrasa_address") || ""),
    supervisor_name_snapshot: String(formData.get("supervisor_name") || ""),
    phone_snapshot: String(formData.get("phone") || ""),
    logo_snapshot: String(formData.get("logo_url") || "") || null,
    notes_snapshot: String(formData.get("notes") || ""),
    extra_data: JSON.parse(JSON.stringify({ rows })),
    updated_by: profile.id,
  };

  const { data: existing } = await supabase
    .from("daily_reports")
    .select("id")
    .eq("report_date", reportDate)
    .eq("report_type", "general")
    .maybeSingle();

  let reportId: string;
  if (existing) {
    const { error } = await supabase
      .from("daily_reports")
      .update(payload)
      .eq("id", existing.id);
    if (error) return { error: "فشل حفظ التقرير: " + error.message };
    reportId = existing.id;
  } else {
    const { data: created, error } = await supabase
      .from("daily_reports")
      .insert({ ...payload, created_by: profile.id })
      .select("id")
      .single();
    if (error) return { error: "فشل حفظ التقرير: " + error.message };
    reportId = created.id;
  }

  if (generatePdf) {
    const { data: fullReport } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("id", reportId)
      .single();
    if (fullReport) {
      try {
        await generateAndStoreReportPdf(supabase, fullReport);
      } catch (e) {
        return { error: e instanceof Error ? e.message : "فشل إنشاء PDF" };
      }
    }
  }

  revalidatePath("/reports/archive");
  redirect(`/reports/${reportId}`);
}

export async function regenerateReportPdfAction(reportId: string) {
  await requireProfile();
  const supabase = await createClient();
  const { data: report } = await supabase
    .from("daily_reports")
    .select("*")
    .eq("id", reportId)
    .single();
  if (!report) throw new Error("التقرير غير موجود");
  await generateAndStoreReportPdf(supabase, report);
  revalidatePath(`/reports/${reportId}`);
  revalidatePath("/reports/archive");
}

export async function deleteReportAction(reportId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("daily_reports").delete().eq("id", reportId);
  revalidatePath("/reports/archive");
  redirect("/reports/archive");
}

export { getSettingsSnapshot };
