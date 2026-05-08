// app/(dashboard)/my-courses/page.tsx
"use client";

import { CheckCircle2 } from "lucide-react";

import { useEnrollments } from "@/hooks/enrollments/use-enrollments";
import { CourseProgressCard } from "@/components/features/dashboard/course-progress-card";
import { EmptyCoursesState } from "@/components/features/dashboard/empty-courses-state";
import WrapperContainer from "@/components/features/dashboard/wrapper-container";

function MyCoursesSkeletonLoader() {
  return (
    <WrapperContainer>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 w-full rounded-[28px] bg-zinc-100 dark:bg-zinc-800 animate-pulse"
          />
        ))}
      </div>
    </WrapperContainer>
  );
}

export default function MyCoursesPage() {
  const { enrollments, isLoading, isError, isEmpty } = useEnrollments();

  if (isLoading) {
    return <MyCoursesSkeletonLoader />;
  }

  if (isError) {
    return (
      <WrapperContainer>
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-red-500 font-medium">
            Kurslar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
          </p>
        </div>
      </WrapperContainer>
    );
  }

  if (isEmpty) {
    return (
      <WrapperContainer>
        <EmptyCoursesState />
      </WrapperContainer>
    );
  }

  const inProgress = enrollments.filter((e) => e.completed_at === null);
  const completed = enrollments.filter((e) => e.completed_at !== null);

  return (
    <WrapperContainer>
      <div className="space-y-8">
        {inProgress.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 tracking-tight">
              Devam Eden Kurslar
            </h2>
            <div className="space-y-4">
              {inProgress.map((item) => (
                <CourseProgressCard
                  key={item.id}
                  course={{
                    course_id: item.course_id,
                    title: item.course.title,
                    slug: item.course.slug,
                    progress_percent: item.progress_percent,
                    last_section_id_str: null,
                    last_section_title: null,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {completed.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 tracking-tight">
              Tamamlanan Kurslar
            </h2>
            <div className="space-y-4">
              {completed.map((item) => (
                <div key={item.id} className="relative">
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Tamamlandı
                    </span>
                  </div>
                  <CourseProgressCard
                    course={{
                      course_id: item.course_id,
                      title: item.course.title,
                      slug: item.course.slug,
                      progress_percent: item.progress_percent,
                      last_section_id_str: null,
                      last_section_title: null,
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </WrapperContainer>
  );
}
