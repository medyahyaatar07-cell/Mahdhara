"use client";

import { useActionState } from "react";
import { Button, Field, Input, Textarea } from "@/components/ui";
import type { Student } from "@/lib/types";
import type { StudentFormState } from "@/app/(app)/students/actions";

export function StudentForm({
  student,
  action,
  submitLabel,
}: {
  student?: Student;
  action: (prev: StudentFormState, formData: FormData) => Promise<StudentFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="الاسم الكامل *">
          <Input name="full_name" required defaultValue={student?.full_name} />
        </Field>
        <Field label="الرقم بالنداء *">
          <Input name="call_number" required defaultValue={student?.call_number} />
        </Field>
        <Field label="اسم ولي الأمر">
          <Input name="guardian_name" defaultValue={student?.guardian_name ?? ""} />
        </Field>
        <Field label="رقم الهاتف">
          <Input
            name="phone"
            dir="ltr"
            className="text-left"
            defaultValue={student?.phone ?? ""}
          />
        </Field>
        <Field label="المستوى">
          <Input name="level" defaultValue={student?.level ?? ""} placeholder="مثال: الحزب الأول" />
        </Field>
        <Field label="تاريخ الميلاد">
          <Input
            type="date"
            name="birth_date"
            defaultValue={student?.birth_date ?? ""}
          />
        </Field>
        <Field label="تاريخ الالتحاق">
          <Input
            type="date"
            name="enrollment_date"
            defaultValue={
              student?.enrollment_date ?? new Date().toISOString().slice(0, 10)
            }
          />
        </Field>
      </div>
      <Field label="ملاحظات">
        <Textarea name="notes" rows={3} defaultValue={student?.notes ?? ""} />
      </Field>

      {state?.error && (
        <p className="rounded-xl bg-rose-100 px-3 py-2 text-sm font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
        {pending ? "جارٍ الحفظ..." : submitLabel}
      </Button>
    </form>
  );
}
