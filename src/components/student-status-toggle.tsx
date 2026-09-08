"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui";
import { toggleStudentStatusAction } from "@/app/(app)/students/actions";

export function StudentStatusToggle({
  studentId,
  status,
}: {
  studentId: string;
  status: "active" | "inactive";
}) {
  const [pending, startTransition] = useTransition();
  const next = status === "active" ? "inactive" : "active";

  return (
    <Button
      variant={status === "active" ? "outline" : "secondary"}
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          toggleStudentStatusAction(studentId, next);
        })
      }
    >
      {pending
        ? "..."
        : status === "active"
        ? "إيقاف الطالب"
        : "تفعيل الطالب"}
    </Button>
  );
}
