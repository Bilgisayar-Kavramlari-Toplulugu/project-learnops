// components/features/dashboard/last-quiz-result.tsx
"use client";

import { FileCheck2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardLastQuizResult } from "@/types";

interface LastQuizResultProps {
  result: DashboardLastQuizResult;
}

export function LastQuizResult({ result }: LastQuizResultProps) {
  const passed = result.passed;

  return (
    <Card
      className="gap-0 rounded-[24px] border-blue-100/80 bg-white/85 py-0 shadow-sm
                 shadow-blue-100/35 dark:border-slate-700 dark:bg-slate-900/80
                 dark:shadow-black/20"
    >
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
            Son Quiz Sonucu
          </p>

          <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {result.score}
            <span className="text-lg text-slate-400">/ 100</span>
          </p>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                passed
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
              }`}
            >
              {passed ? "Geçti ✓" : "Kaldı ✗"}
            </Badge>

            {result.course_title && (
              <span className="truncate text-sm text-slate-600 dark:text-slate-300">
                {result.course_title}
              </span>
            )}
          </div>
        </div>

        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${
            passed
              ? "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
              : "border-red-100 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >
          <FileCheck2 className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
