"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Field, Input, Select, Badge } from "@/components/ui";
import type { Profile } from "@/lib/types";

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function UsersManager({ initialUsers }: { initialUsers: Profile[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"admin" | "supervisor">("supervisor");
  const [password, setPassword] = useState(randomPassword());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null);

  async function handleCreate() {
    setError(null);
    setCreatedCreds(null);
    if (!email || !fullName || !password) {
      setError("جميع الحقول مطلوبة");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("انتهت الجلسة، الرجاء إعادة تسجيل الدخول");
        return;
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/admin-create-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ email, password, full_name: fullName, role }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "تعذر إنشاء المستخدم");
        return;
      }
      setUsers((prev) => [
        ...prev,
        {
          id: json.user_id,
          full_name: fullName,
          role,
          phone: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      setCreatedCreds({ email, password });
      setEmail("");
      setFullName("");
      setPassword(randomPassword());
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {users.map((u) => (
          <Card key={u.id} className="flex items-center justify-between p-3">
            <div>
              <p className="font-bold">{u.full_name}</p>
              {u.phone && <p className="text-xs text-foreground/50">{u.phone}</p>}
            </div>
            <Badge
              className={
                u.role === "admin"
                  ? "border-teal-300 bg-teal-100 text-teal-800 dark:border-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                  : "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }
            >
              {u.role === "admin" ? "مسؤول" : "مشرف"}
            </Badge>
          </Card>
        ))}
      </div>

      <Card className="space-y-3 p-4">
        <p className="font-black">إضافة مستخدم جديد</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="الاسم الكامل">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="البريد الإلكتروني">
            <Input
              type="email"
              dir="ltr"
              className="text-left"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="الدور">
            <Select value={role} onChange={(e) => setRole(e.target.value as "admin" | "supervisor")}>
              <option value="supervisor">مشرف</option>
              <option value="admin">مسؤول</option>
            </Select>
          </Field>
          <Field label="كلمة المرور المؤقتة">
            <Input dir="ltr" className="text-left" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
        </div>
        {error && (
          <p className="rounded-xl bg-rose-100 px-3 py-2 text-sm font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
            {error}
          </p>
        )}
        {createdCreds && (
          <p className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
            تم إنشاء الحساب. البريد: {createdCreds.email} — كلمة المرور: {createdCreds.password}
            <br />
            شارك هذه البيانات مع المستخدم بأمان — لن تظهر مرة أخرى.
          </p>
        )}
        <Button onClick={handleCreate} disabled={busy}>
          {busy ? "جارٍ الإنشاء..." : "إنشاء المستخدم"}
        </Button>
      </Card>
    </div>
  );
}
