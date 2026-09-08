"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui";

export function WhatsAppShareButton({
  reportId,
  fileName,
  message,
}: {
  reportId: string;
  fileName: string;
  message: string;
}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleShare() {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/reports/${reportId}/file`);
      if (!res.ok) {
        setNotice("لا يوجد ملف PDF بعد. الرجاء إنشاء PDF أولًا.");
        return;
      }
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "application/pdf" });

      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
        share?: (data: { files?: File[]; text?: string; title?: string }) => Promise<void>;
      };

      if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], text: message, title: fileName });
        return;
      }

      // Fallback: download the PDF, then open WhatsApp with a pre-filled message.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setNotice("تم تنزيل الملف. أرفقه يدويًا في محادثة واتساب التي فُتحت الآن.");
      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    } catch {
      setNotice("تعذرت المشاركة. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Button variant="secondary" size="sm" onClick={handleShare} disabled={busy}>
        <Share2 size={16} />
        {busy ? "جارٍ التجهيز..." : "مشاركة عبر واتساب"}
      </Button>
      {notice && <p className="mt-1.5 text-xs text-foreground/60">{notice}</p>}
    </div>
  );
}
