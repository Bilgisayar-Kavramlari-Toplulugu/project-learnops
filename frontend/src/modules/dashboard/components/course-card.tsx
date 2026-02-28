import { Play } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import type { CourseCardItem } from "@/shared/types";

interface CourseCardProps {
  course: CourseCardItem;
}

const progressToneClass: Record<CourseCardItem["progressTone"], string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
};

const iconToneClass: Record<CourseCardItem["progressTone"], string> = {
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
};

export function CourseCard({ course }: CourseCardProps) {
  const Icon = course.icon;

  return (
    <Card className="h-full border-blue-100/90 bg-white/90 shadow-md shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl",
              iconToneClass[course.progressTone],
            )}
          >
            <Icon className="size-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl leading-tight font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {course.title}
            </h4>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {course.description}
            </p>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={cn("h-full rounded-full", progressToneClass[course.progressTone])}
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <p className="font-medium text-slate-700 dark:text-slate-300">
              {course.completedLessons}/{course.totalLessons} Lessons
            </p>
            <Badge
              variant="outline"
              className="rounded-full border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {course.level}
            </Badge>
          </div>
          <Button
            variant="outline"
            className="h-10 w-full rounded-xl border-blue-200 bg-white text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-slate-800"
          >
            <Play className="size-4" />
            Resume
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
