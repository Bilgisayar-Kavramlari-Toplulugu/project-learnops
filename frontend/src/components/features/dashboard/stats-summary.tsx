import { BookOpenCheck, Trophy, TrendingUp, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStatSummaryItem } from "@/types";

const statIconMap: Record<string, LucideIcon> = {
  in_progress_courses: BookOpenCheck,
  completed_courses: Trophy,
  average_progress: TrendingUp,
};

const statToneMap: Record<string, string> = {
  in_progress_courses:
    "bg-blue-50 text-blue-700 border-blue-100 dark:bg-slate-800 dark:text-sky-300 dark:border-slate-700",
  completed_courses:
    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50",
  average_progress:
    "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/25 dark:text-amber-300 dark:border-amber-900/50",
};

interface StatsSummaryProps {
  items: DashboardStatSummaryItem[];
}

export function StatsSummary({ items }: StatsSummaryProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {items.map((item) => {
        const Icon = statIconMap[item.key];

        return (
          <Card
            key={item.key}
            className="gap-0 rounded-[24px] border-blue-100/80 bg-white/85 py-0 shadow-sm shadow-blue-100/35 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20"
          >
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                  {item.label}
                </p>
                <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {item.value}
                </p>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>
              </div>
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${statToneMap[item.key]}`}
              >
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
