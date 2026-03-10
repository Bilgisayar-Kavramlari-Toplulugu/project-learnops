import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UpcomingExam } from "@/types";

interface UpcomingExamCardProps {
  exam: UpcomingExam;
}

export function UpcomingExamCard({ exam }: UpcomingExamCardProps) {
  return (
    <Card className="border-blue-100/90 bg-white/90 shadow-md shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-[2rem] leading-tight font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Upcoming Exams
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-blue-100 bg-white p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-2xl leading-tight font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {exam.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Next attempt: {exam.nextAttempt}
              </p>
            </div>
            <Button className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-semibold hover:bg-blue-700 dark:bg-sky-500 dark:text-slate-900 dark:hover:bg-sky-400">
              Start Exam
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${exam.readiness}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {exam.readiness}% readiness
            </p>
            <Badge
              variant="outline"
              className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/35 dark:text-emerald-300"
            >
              {exam.level}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
