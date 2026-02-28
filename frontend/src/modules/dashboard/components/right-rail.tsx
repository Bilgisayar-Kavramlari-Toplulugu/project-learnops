import { Flame, GraduationCap, Trophy } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { DashboardSuggestion } from "@/shared/types";

interface DashboardRightRailProps {
  streakDays: number;
  rankPoints: number;
  rankLabel: string;
  suggestion: DashboardSuggestion;
}

export function DashboardRightRail({
  streakDays,
  rankPoints,
  rankLabel,
  suggestion,
}: DashboardRightRailProps) {
  const SuggestionIcon = suggestion.icon;

  return (
    <aside className="space-y-4 xl:sticky xl:top-5 xl:self-start">
      <Card className="border-blue-100/90 bg-white/90 shadow-md shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            <Flame className="size-5 text-amber-500" />
            Your Streak
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-base font-medium text-slate-700 dark:text-slate-300">
            {streakDays} Days progress
          </p>
          <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {rankPoints} points
            </p>
            <Badge className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-700 dark:text-slate-100">
              {rankLabel}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-100/90 bg-white/90 shadow-md shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            <span>Suggestions</span>
            <span className="text-sm font-medium text-blue-600 dark:text-sky-400">View all</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-slate-700 dark:text-sky-300">
                <SuggestionIcon className="size-5" />
              </div>
              <div>
                <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {suggestion.title}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{suggestion.level}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between rounded-xl border border-blue-100 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <span className="inline-flex items-center gap-2">
              <GraduationCap className="size-4 text-slate-500 dark:text-slate-400" />
              Retake
            </span>
            <Trophy className="size-4 text-amber-500" />
          </button>
        </CardContent>
      </Card>
    </aside>
  );
}
