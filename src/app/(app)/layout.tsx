import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TopBar, DesktopSidebar, BottomNav } from "@/components/nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("madrasa_settings")
    .select("madrasa_name")
    .eq("id", 1)
    .single();

  return (
    <div className="min-h-screen">
      <TopBar
        madrasaName={settings?.madrasa_name || "محضرة"}
        fullName={profile.full_name}
      />
      <div className="mx-auto flex max-w-6xl">
        <DesktopSidebar />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
