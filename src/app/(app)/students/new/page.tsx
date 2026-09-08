import { Card } from "@/components/ui";
import { StudentForm } from "@/components/student-form";
import { createStudentAction } from "@/app/(app)/students/actions";

export default function NewStudentPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-black">إضافة طالب جديد</h1>
      <Card className="p-4 sm:p-6">
        <StudentForm action={createStudentAction} submitLabel="حفظ الطالب" />
      </Card>
    </div>
  );
}
