import { ArrowRight, CalendarClock, ShieldCheck } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ThemeExamCardProps {
  title: string;
  nextAttempt: string;
  readiness: number;
  level: string;
  actionLabel?: string;
  className?: string;
}

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function ThemeExamCard({
  title,
  nextAttempt,
  readiness,
  level,
  actionLabel = "Start Exam",
  className,
}: ThemeExamCardProps) {
  const safeReadiness = clampPercentage(readiness);

  return (
    <article
      className={cn(
        "space-y-4 rounded-2xl border border-blue-100/90 bg-white/90 p-4 shadow-md shadow-blue-100/45 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase dark:text-slate-500">
            <ShieldCheck className="size-3.5" />
            Exam Template
          </p>
          <h3 className="text-xl leading-tight font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <p className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <CalendarClock className="size-3.5" />
            Next attempt: {nextAttempt}
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-300">
          {level}
        </span>
      </header>

      <div className="space-y-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-blue-500 dark:bg-sky-400"
            style={{ width: `${safeReadiness}%` }}
          />
        </div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Readiness: {safeReadiness}%
        </p>
      </div>

      <Button className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-sky-500 dark:text-slate-900 dark:hover:bg-sky-400">
        {actionLabel}
        <ArrowRight className="size-4" />
      </Button>
    </article>
  );
}
