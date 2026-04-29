import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CourseCardItem } from "@/types";
import { CourseCard } from "./course-card";

interface EnrolledCoursesSectionProps {
  courses: CourseCardItem[];
}

export function EnrolledCoursesSection({ courses }: EnrolledCoursesSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[2rem] leading-tight font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Kurslarım
        </h3>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {courses.length > 0 ? (
          courses.map((course) => <CourseCard key={course.id} course={course} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-blue-200/90 bg-white/75 px-4 py-6 text-sm font-medium text-slate-500 md:col-span-2 2xl:col-span-3 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
            Henuz kurs verisi gelmedi. Backend baglaninca burada listelenecek.
          </div>
        )}
      </div>
    </section>
  );
}
