"use client";

import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui";

export function DateFilter({ date }: { date: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Input
      type="date"
      defaultValue={date}
      className="w-40"
      onChange={(e) => {
        if (e.target.value) {
          router.push(`${pathname}?date=${e.target.value}`);
        }
      }}
    />
  );
}
