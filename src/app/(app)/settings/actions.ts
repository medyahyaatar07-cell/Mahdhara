"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type SettingsFormState = { error?: string; success?: boolean } | null;

export async function updateSettingsAction(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const profile = await requireAdmin();
  const supabase = await createClient();

  let logoUrl = String(formData.get("current_logo_url") || "") || null;
  const logoFile = formData.get("logo_file");

  if (logoFile instanceof File && logoFile.size > 0) {
    const ext = logoFile.name.split(".").pop() || "png";
    const path = `madrasa/logo-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, logoFile, { upsert: true, contentType: logoFile.type });
    if (uploadError) {
      return { error: "فشل رفع الشعار: " + uploadError.message };
    }
    const { data: pub } = supabase.storage.from("logos").getPublicUrl(path);
    logoUrl = pub.publicUrl;
  }

  const payload = {
    madrasa_name: String(formData.get("madrasa_name") || "محضرة"),
    address: String(formData.get("address") || ""),
    supervisor_name: String(formData.get("supervisor_name") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    extra_info: String(formData.get("extra_info") || ""),
    logo_url: logoUrl,
    show_logo: formData.get("show_logo") === "on",
    show_phone: formData.get("show_phone") === "on",
    show_address: formData.get("show_address") === "on",
    show_supervisor: formData.get("show_supervisor") === "on",
    signature_text: String(formData.get("signature_text") || "توقيع المشرف"),
    default_report_title: String(
      formData.get("default_report_title") || "التقرير اليومي للطالب"
    ),
    date_format: String(formData.get("date_format") || "DD/MM/YYYY"),
    dark_mode_default: formData.get("dark_mode_default") === "on",
    updated_by: profile.id,
  };

  const { error } = await supabase
    .from("madrasa_settings")
    .update(payload)
    .eq("id", 1);

  if (error) {
    return { error: "فشل حفظ الإعدادات: " + error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}
