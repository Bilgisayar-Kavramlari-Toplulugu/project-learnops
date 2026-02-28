import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

export function ThemeFormCard({ className, ...props }: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-blue-100/85 bg-white/85 p-4 shadow-sm shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/75 dark:shadow-black/20",
        className,
      )}
      {...props}
    />
  );
}

interface ThemeFieldProps extends ComponentPropsWithoutRef<"div"> {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function ThemeField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
  ...props
}: ThemeFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400"
      >
        {label}
        {required ? " *" : ""}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function ThemeFormActions({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

interface ThemeCheckboxFieldProps extends Omit<ComponentPropsWithoutRef<"input">, "type"> {
  label: string;
}

export function ThemeCheckboxField({ label, className, ...props }: ThemeCheckboxFieldProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300",
        className,
      )}
    >
      <input
        type="checkbox"
        className="size-4 rounded border border-blue-300 text-blue-600 accent-blue-600 dark:border-slate-600 dark:accent-sky-400"
        {...props}
      />
      {label}
    </label>
  );
}
