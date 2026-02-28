import type { InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function AuthField({ label, id, className, ...props }: AuthFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5 text-left">
      <label
        htmlFor={inputId}
        className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "h-10 w-full rounded-xl border border-blue-200/90 bg-white px-3 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-500/70 dark:focus:ring-sky-500/20",
          className,
        )}
        {...props}
      />
    </div>
  );
}
