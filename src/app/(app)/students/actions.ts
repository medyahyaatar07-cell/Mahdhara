"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireProfile } from "@/lib/auth";

export type StudentFormState = { error?: string } | null;

function readStudentForm(formData: FormData) {
  return {
    call_number: String(formData.get("call_number") || "").trim(),
    full_name: String(formData.get("full_name") || "").trim(),
    guardian_name: String(formData.get("guardian_name") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    level: String(formData.get("level") || "").trim() || null,
    birth_date: String(formData.get("birth_date") || "").trim() || null,
    enrollment_date:
      String(formData.get("enrollment_date") || "").trim() || undefined,
    notes: String(formData.get("notes") || "").trim() || null,
  };
}

export async function createStudentAction(
  _prev: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const values = readStudentForm(formData);

  if (!values.call_number || !values.full_name) {
    return { error: "الاسم الكامل والرقم بالنداء مطلوبان" };
  }

  const { data: existing } = await supabase
    .from("students")
    .select("id")
    .eq("call_number", values.call_number)
    .maybeSingle();

  if (existing) {
    return { error: "الرقم بالنداء مستخدم من قبل طالب آخر" };
  }

  const { data: created, error } = await supabase
    .from("students")
    .insert({ ...values, created_by: profile.id, updated_by: profile.id })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "الرقم بالنداء مستخدم من قبل طالب آخر" };
    }
    return { error: "حدث خطأ أثناء الحفظ: " + error.message };
  }

  revalidatePath("/students");
  redirect(`/students/${created.id}`);
}

export async function updateStudentAction(
  studentId: string,
  _prev: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const values = readStudentForm(formData);

  if (!values.call_number || !values.full_name) {
    return { error: "الاسم الكامل والرقم بالنداء مطلوبان" };
  }

  const { data: existing } = await supabase
    .from("students")
    .select("id")
    .eq("call_number", values.call_number)
    .neq("id", studentId)
    .maybeSingle();

  if (existing) {
    return { error: "الرقم بالنداء مستخدم من قبل طالب آخر" };
  }

  const { error } = await supabase
    .from("students")
    .update({ ...values, updated_by: profile.id })
    .eq("id", studentId);

  if (error) {
    return { error: "حدث خطأ أثناء الحفظ: " + error.message };
  }

  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
  redirect(`/students/${studentId}`);
}

export async function toggleStudentStatusAction(
  studentId: string,
  newStatus: "active" | "inactive"
) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase
    .from("students")
    .update({ status: newStatus, updated_by: profile.id })
    .eq("id", studentId);

  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
}

export async function deleteStudentAction(studentId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("students").delete().eq("id", studentId);
  revalidatePath("/students");
  redirect("/students");
}
