"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import { Button, Card, Field, Input } from "@/components/ui";

function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="البريد الإلكتروني">
        <Input
          name="email"
          type="email"
          autoComplete="email"
          required
          dir="ltr"
          className="text-left"
          placeholder="example@email.com"
        />
      </Field>
      <Field label="كلمة المرور">
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          className="text-left"
          placeholder="••••••••"
        />
      </Field>

      {state?.error && (
        <p className="rounded-xl bg-rose-100 px-3 py-2 text-sm font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "جارٍ الدخول..." : "دخول"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/10 to-transparent px-4">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-primary-foreground">
            م
          </div>
          <h1 className="text-xl font-black">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-foreground/60">نظام إدارة المحضرة</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
