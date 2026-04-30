// components/features/dashboard/course-progress-card.tsx
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Progress,
} from "@/components/ui";
import type { DashboardInProgressCourse } from "@/types";

interface CourseProgressCardProps {
  course: DashboardInProgressCourse;
}

export function CourseProgressCard({ course }: CourseProgressCardProps) {
  return (
    <Card className="gap-0 rounded-[28px] border-blue-100/80 bg-white/90 py-0 shadow-sm shadow-blue-100/40 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
      <CardHeader className="gap-4 border-b border-blue-100/80 px-5 py-5 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-xl leading-tight tracking-tight text-slate-900 dark:text-slate-100">
              {course.title}
            </CardTitle>

            {course.last_section_title && (
              <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <BookOpen className="size-3.5 shrink-0" />
                Son: {course.last_section_title}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-right dark:border-slate-700 dark:bg-slate-800/80">
            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
              İlerleme
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              %{course.progress_percent}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-5">
        <Progress
          value={course.progress_percent}
          className="h-2.5 bg-blue-100 dark:bg-slate-800 [&_[data-slot=progress-indicator]]:bg-blue-600 dark:[&_[data-slot=progress-indicator]]:bg-sky-400"
        />
      </CardContent>

      <CardFooter className="border-t border-blue-100/80 px-5 py-4 dark:border-slate-800">
        <Button
          asChild
          variant="outline"
          className="h-10 rounded-xl border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-slate-800"
        >
          <Link
            href={
              course.last_section_id_str
                ? `/courses/${course.slug}/${course.last_section_id_str}` // kaldığı yerden devam
                : `/courses/${course.slug}`
            }
          >
            Devam Et
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
