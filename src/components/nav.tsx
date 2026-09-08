"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardCheck,
  Users,
  Archive,
  Settings,
  BarChart3,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/(app)/actions";

const NAV_ITEMS = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/attendance", label: "الحضور", icon: ClipboardCheck },
  { href: "/students", label: "الطلاب", icon: Users },
  { href: "/reports/archive", label: "الأرشيف", icon: Archive },
  { href: "/statistics", label: "الإحصائيات", icon: BarChart3 },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

const BOTTOM_NAV_ITEMS = NAV_ITEMS.slice(0, 5);

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  return (
    <button
      aria-label="تبديل الوضع الليلي"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
    >
      {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export function TopBar({
  madrasaName,
  fullName,
}: {
  madrasaName: string;
  fullName: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
          م
        </div>
        <span className="font-black">{madrasaName}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="hidden text-sm text-foreground/60 sm:inline">
          {fullName}
        </span>
        <ThemeToggle />
        <form action={signOutAction}>
          <button
            aria-label="تسجيل الخروج"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          >
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </header>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 flex-col gap-1 overflow-y-auto border-l border-border p-3 sm:flex">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition",
              active
                ? "bg-primary text-primary-foreground"
                : "hover:bg-black/5 dark:hover:bg-white/10"
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background/95 backdrop-blur sm:hidden">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-bold",
              active ? "text-primary" : "text-foreground/50"
            )}
          >
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
