import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { StudentForm } from "@/components/student-form";
import { updateStudentAction } from "@/app/(app)/students/actions";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (!student) notFound();

  const boundAction = updateStudentAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-black">تعديل بيانات الطالب</h1>
      <Card className="p-4 sm:p-6">
        <StudentForm
          student={student}
          action={boundAction}
          submitLabel="حفظ التعديلات"
        />
      </Card>
    </div>
  );
}
