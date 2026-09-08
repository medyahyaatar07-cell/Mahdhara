"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { deleteStudentAction } from "@/app/(app)/students/actions";

export function StudentDeleteButton({ studentId }: { studentId: string }) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirmDelete) {
          setConfirmDelete(true);
          setTimeout(() => setConfirmDelete(false), 3000);
          return;
        }
        startTransition(() => {
          deleteStudentAction(studentId);
        });
      }}
    >
      <Trash2 size={16} />
      {pending ? "جارٍ الحذف..." : confirmDelete ? "تأكيد الحذف نهائيًا؟" : "حذف الطالب"}
    </Button>
  );
}
