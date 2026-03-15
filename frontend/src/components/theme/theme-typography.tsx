import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type TextProps = ComponentPropsWithoutRef<"p">;
type HeadingProps = ComponentPropsWithoutRef<"h1">;

export function ThemeKicker({ className, ...props }: TextProps) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase dark:text-slate-500",
        className,
      )}
      {...props}
    />
  );
}

export function ThemeH1({ className, ...props }: HeadingProps) {
  return (
    <h1
      className={cn(
        "text-4xl leading-tight font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
}

export function ThemeH2({ className, ...props }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cn(
        "text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
}

export function ThemeH3({ className, ...props }: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className={cn(
        "text-lg leading-tight font-semibold tracking-tight text-slate-900 dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
}

export function ThemeLead({ className, ...props }: TextProps) {
  return (
    <p
      className={cn("text-base leading-relaxed text-slate-600 dark:text-slate-300", className)}
      {...props}
    />
  );
}

export function ThemeText({ className, ...props }: TextProps) {
  return (
    <p
      className={cn("text-sm leading-relaxed text-slate-600 dark:text-slate-300", className)}
      {...props}
    />
  );
}

export function ThemeMuted({ className, ...props }: TextProps) {
  return <p className={cn("text-xs text-slate-500 dark:text-slate-400", className)} {...props} />;
}
