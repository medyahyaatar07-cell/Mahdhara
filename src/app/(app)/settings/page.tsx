import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings-form";
import { UsersManager } from "@/components/users-manager";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: settings }, { data: users }] = await Promise.all([
    supabase.from("madrasa_settings").select("*").eq("id", 1).single(),
    supabase.from("profiles").select("*").order("created_at"),
  ]);

  if (!settings) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-black">الإعدادات</h1>
      <Card className="p-4 sm:p-6">
        <SettingsForm settings={settings} />
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-black">المستخدمون والصلاحيات</h2>
        <UsersManager initialUsers={users || []} />
      </div>
    </div>
  );
}
