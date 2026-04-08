import { Clock, GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";

interface CourseListCardProps {
  course: Course;
}

export function CourseListCard({ course }: CourseListCardProps) {
  const difficultyColorMap: Record<Course["difficulty"], string> = {
    beginner: "text-emerald-700 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    intermediate: "text-blue-700 bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    advanced: "text-indigo-700 bg-indigo-50 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800",
  };

  const difficultyLabels: Record<Course["difficulty"], string> = {
    beginner: "Başlangıç",
    intermediate: "Orta Seviye",
    advanced: "İleri Seviye",
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-slate-200/60 bg-white/70 backdrop-blur-sm transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:border-blue-500/30">
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <Badge
            variant="outline"
            className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400"
          >
            {course.category}
          </Badge>
          <div className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <GraduationCap className="size-4" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="line-clamp-2 text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
            {course.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {course.description}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5 text-sm dark:border-slate-800/50">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Clock className="size-4 opacity-70" />
            <span className="font-medium">{course.duration_minutes} dk</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              difficultyColorMap[course.difficulty],
            )}
          >
            {difficultyLabels[course.difficulty]}
          </Badge>
        </div>

        <div className="mt-6">
          <Button
            asChild
            className="w-full rounded-xl bg-slate-900 font-semibold text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <Link href={`/courses/${course.slug}`}>
              Kursu İncele
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
