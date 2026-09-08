import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, EmptyState, Input, LinkButton } from "@/components/ui";
import { UserPlus, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "active" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select("id, call_number, full_name, guardian_name, phone, level, status")
    .order("call_number", { ascending: true });

  if (status !== "all") {
    query = query.eq("status", status);
  }
  if (q) {
    query = query.or(
      `full_name.ilike.%${q}%,call_number.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }

  const { data: students } = await query;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">الطلاب</h1>
        <LinkButton href="/students/new" size="sm">
          <UserPlus size={18} />
          إضافة طالب
        </LinkButton>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row" method="get">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40"
          />
          <Input
            name="q"
            defaultValue={q}
            placeholder="ابحث بالاسم أو الرقم بالنداء أو الهاتف..."
            className="pr-10"
          />
        </div>
        <div className="flex gap-2">
          <FilterLink status="active" current={status} label="نشط" q={q} />
          <FilterLink status="inactive" current={status} label="غير نشط" q={q} />
          <FilterLink status="all" current={status} label="الكل" q={q} />
        </div>
      </form>

      {!students?.length ? (
        <EmptyState
          title="لا يوجد طلاب"
          description="لم يتم العثور على أي طالب مطابق. جرّب إضافة طالب جديد."
          action={<LinkButton href="/students/new">إضافة طالب</LinkButton>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <Link key={s.id} href={`/students/${s.id}`}>
              <Card className="h-full p-4 transition hover:border-primary">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-black">{s.full_name}</p>
                    <p className="text-sm text-foreground/60">
                      الرقم بالنداء: {s.call_number}
                    </p>
                    {s.level && (
                      <p className="text-sm text-foreground/60">{s.level}</p>
                    )}
                  </div>
                  <Badge
                    className={
                      s.status === "active"
                        ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    }
                  >
                    {s.status === "active" ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterLink({
  status,
  current,
  label,
  q,
}: {
  status: string;
  current: string;
  label: string;
  q: string;
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("status", status);
  const active = status === current;
  return (
    <Link
      href={`/students?${params.toString()}`}
      className={`rounded-xl border-2 px-3 py-2 text-sm font-bold ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border"
      }`}
    >
      {label}
    </Link>
  );
}
