"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { AttendanceStatus } from "@/lib/types";

export interface AttendanceRowInput {
  student_id: string;
  status: AttendanceStatus;
  daily_achievement: string;
  absence_reason: string;
  notes: string;
}

export async function saveAttendanceDayAction(
  date: string,
  rows: AttendanceRowInput[]
): Promise<{ error?: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  if (!rows.length) return {};

  const payload = rows.map((r) => ({
    student_id: r.student_id,
    date,
    status: r.status,
    daily_achievement: r.daily_achievement || null,
    absence_reason: r.status === "absent" ? r.absence_reason || null : null,
    notes: r.notes || null,
    updated_by: profile.id,
    created_by: profile.id,
  }));

  const { error } = await supabase
    .from("daily_attendance")
    .upsert(payload, { onConflict: "student_id,date" });

  if (error) {
    return { error: "فشل حفظ الحضور: " + error.message };
  }

  revalidatePath("/attendance");
  revalidatePath("/");
  return {};
}
