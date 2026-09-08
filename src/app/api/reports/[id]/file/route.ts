import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { data: report } = await supabase
    .from("daily_reports")
    .select("pdf_path")
    .eq("id", id)
    .single();

  if (!report?.pdf_path) {
    return NextResponse.json({ error: "لا يوجد ملف PDF لهذا التقرير" }, { status: 404 });
  }

  const { data: signed, error } = await supabase.storage
    .from("reports")
    .createSignedUrl(report.pdf_path, 60 * 10);

  if (error || !signed) {
    return NextResponse.json({ error: "تعذر الوصول إلى الملف" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
