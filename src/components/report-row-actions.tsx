"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { Eye, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { WhatsAppShareButton } from "@/components/whatsapp-share";
import { regenerateReportPdfAction, deleteReportAction } from "@/app/(app)/reports/actions";
import { reportFileName } from "@/lib/pdf/filename";
import type { DailyReport } from "@/lib/types";

function editHref(report: Pick<DailyReport, "report_type" | "report_date" | "student_id">) {
  if (report.report_type === "student" && report.student_id) {
    return `/reports/new/student/${report.student_id}?date=${report.report_date}`;
  }
  if (report.report_type === "absence") {
    return `/reports/new/absence?date=${report.report_date}`;
  }
  return `/reports/new/general?date=${report.report_date}`;
}

export function ReportRowActions({
  report,
  isAdmin,
  compact,
}: {
  report: DailyReport;
  isAdmin: boolean;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const message =
    report.report_type === "student"
      ? `السلام عليكم، نرفق لكم ${report.report_title} للطالب ${report.student_name_snapshot} بتاريخ ${report.report_date}.`
      : `السلام عليكم، نرفق لكم ${report.report_title} بتاريخ ${report.report_date}.`;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "text-sm" : ""}`}>
      <Link href={`/reports/${report.id}`}>
        <Button variant="outline" size="sm">
          <Eye size={16} />
          عرض
        </Button>
      </Link>
      <Link href={editHref(report)}>
        <Button variant="outline" size="sm">
          <Pencil size={16} />
          تعديل
        </Button>
      </Link>
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => regenerateReportPdfAction(report.id))}
      >
        <RefreshCw size={16} className={pending ? "animate-spin" : ""} />
        إعادة إنشاء PDF
      </Button>
      <WhatsAppShareButton
        reportId={report.id}
        fileName={reportFileName(report)}
        message={message}
      />
      {isAdmin && (
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            if (!confirmDelete) {
              setConfirmDelete(true);
              setTimeout(() => setConfirmDelete(false), 3000);
              return;
            }
            startTransition(() => deleteReportAction(report.id));
          }}
        >
          <Trash2 size={16} />
          {confirmDelete ? "تأكيد الحذف؟" : "حذف"}
        </Button>
      )}
    </div>
  );
}
