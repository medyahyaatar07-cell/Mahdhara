"use client";

import { useActionState, useState } from "react";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { updateSettingsAction } from "@/app/(app)/settings/actions";
import type { MadrasaSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: MadrasaSettings }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, null);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo_url);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="current_logo_url" value={settings.logo_url ?? ""} />

      <section className="space-y-4">
        <h2 className="text-lg font-black">بيانات المحضرة</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم المحضرة">
            <Input name="madrasa_name" defaultValue={settings.madrasa_name} required />
          </Field>
          <Field label="العنوان">
            <Input name="address" defaultValue={settings.address} />
          </Field>
          <Field label="اسم المشرف">
            <Input name="supervisor_name" defaultValue={settings.supervisor_name} />
          </Field>
          <Field label="رقم الهاتف">
            <Input name="phone" dir="ltr" className="text-left" defaultValue={settings.phone ?? ""} />
          </Field>
          <Field label="البريد الإلكتروني">
            <Input
              name="email"
              type="email"
              dir="ltr"
              className="text-left"
              defaultValue={settings.email ?? ""}
            />
          </Field>
          <Field label="الشعار">
            <Input
              type="file"
              name="logo_file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setLogoPreview(URL.createObjectURL(file));
              }}
            />
          </Field>
        </div>
        {logoPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoPreview} alt="الشعار" className="h-16 w-16 rounded-xl border border-border object-contain" />
        )}
        <Field label="معلومات إضافية">
          <Textarea name="extra_info" rows={2} defaultValue={settings.extra_info ?? ""} />
        </Field>
      </section>

      <hr className="border-border" />

      <section className="space-y-4">
        <h2 className="text-lg font-black">إعدادات التقارير</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle name="show_logo" label="إظهار الشعار" defaultChecked={settings.show_logo} />
          <Toggle name="show_phone" label="إظهار رقم الهاتف" defaultChecked={settings.show_phone} />
          <Toggle name="show_address" label="إظهار العنوان" defaultChecked={settings.show_address} />
          <Toggle
            name="show_supervisor"
            label="إظهار اسم المشرف"
            defaultChecked={settings.show_supervisor}
          />
        </div>
        <Field label="عنوان التقرير الافتراضي">
          <Input name="default_report_title" defaultValue={settings.default_report_title} />
        </Field>
        <Field label="نص التوقيع">
          <Input name="signature_text" defaultValue={settings.signature_text} />
        </Field>
      </section>

      <hr className="border-border" />

      <section className="space-y-4">
        <h2 className="text-lg font-black">إعدادات النظام</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="المنطقة الزمنية" hint="ثابتة على توقيت موريتانيا">
            <Input value="Africa/Nouakchott" disabled dir="ltr" className="text-left" />
          </Field>
          <Field label="تنسيق التاريخ">
            <Input name="date_format" defaultValue={settings.date_format} dir="ltr" className="text-left" />
          </Field>
        </div>
        <Toggle
          name="dark_mode_default"
          label="تفعيل الوضع الليلي افتراضيًا للمستخدمين الجدد"
          defaultChecked={settings.dark_mode_default}
        />
      </section>

      {state?.error && (
        <p className="rounded-xl bg-rose-100 px-3 py-2 text-sm font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          تم حفظ الإعدادات بنجاح
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
      </Button>
    </form>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-border px-4 py-3">
      <span className="text-sm font-bold">{label}</span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-5 w-5 accent-teal-600"
      />
    </label>
  );
}
