import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/lib/utils";

interface ThemeInputProps extends ComponentPropsWithoutRef<"input"> {
  invalid?: boolean;
}

interface ThemeTextareaProps extends ComponentPropsWithoutRef<"textarea"> {
  invalid?: boolean;
}

export const ThemeInput = forwardRef<HTMLInputElement, ThemeInputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-blue-200/90 bg-white px-3 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-500/70 dark:focus:ring-sky-500/20",
        invalid &&
          "border-red-300 focus:border-red-400 focus:ring-red-200/50 dark:border-red-800 dark:focus:border-red-500 dark:focus:ring-red-500/20",
        className,
      )}
      {...props}
    />
  ),
);

ThemeInput.displayName = "ThemeInput";

export const ThemeTextarea = forwardRef<HTMLTextAreaElement, ThemeTextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-xl border border-blue-200/90 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-500/70 dark:focus:ring-sky-500/20",
        invalid &&
          "border-red-300 focus:border-red-400 focus:ring-red-200/50 dark:border-red-800 dark:focus:border-red-500 dark:focus:ring-red-500/20",
        className,
      )}
      {...props}
    />
  ),
);

ThemeTextarea.displayName = "ThemeTextarea";
