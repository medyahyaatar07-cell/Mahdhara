"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
} from "react";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none",
        size === "sm" && "px-3 py-2 text-sm",
        size === "md" && "px-4 py-2.5 text-base",
        size === "lg" && "px-6 py-3.5 text-lg",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:opacity-90 shadow-sm shadow-primary/20",
        variant === "secondary" &&
          "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600",
        variant === "outline" &&
          "border-2 border-border bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
        variant === "ghost" && "bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
        variant === "danger" && "bg-rose-600 text-white hover:bg-rose-700",
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  className,
  variant = "primary",
  size = "md",
  children,
}: {
  href: string;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition active:scale-[0.98] select-none",
        size === "sm" && "px-3 py-2 text-sm",
        size === "md" && "px-4 py-2.5 text-base",
        size === "lg" && "px-6 py-3.5 text-lg",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:opacity-90 shadow-sm shadow-primary/20",
        variant === "secondary" &&
          "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600",
        variant === "outline" &&
          "border-2 border-border bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
        variant === "ghost" && "bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
        variant === "danger" && "bg-rose-600 text-white hover:bg-rose-700",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border-2 border-border bg-transparent px-4 py-2.5 text-base outline-none transition focus:border-primary",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border-2 border-border bg-transparent px-4 py-2.5 text-base outline-none transition focus:border-primary resize-y",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border-2 border-border bg-transparent px-4 py-2.5 text-base outline-none transition focus:border-primary",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("mb-1.5 block text-sm font-bold text-foreground/80", className)}>
      {children}
    </label>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint && <p className="mt-1 text-xs text-foreground/50">{hint}</p>}
    </div>
  );
}

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold",
        className
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center px-4">
      <p className="text-lg font-bold">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-foreground/60">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
