// app/dashboard/page.tsx - useProfile tamamen çıktı
"use client";

import { RefreshCw } from "lucide-react";

import { CourseProgressCard } from "@/components/features/dashboard/course-progress-card";
import { DashboardSkeleton } from "@/components/features/dashboard/dashboard-skeleton";
import { EmptyCoursesState } from "@/components/features/dashboard/empty-courses-state";
import { StatsSummary } from "@/components/features/dashboard/stats-summary";
import { WelcomeHeader } from "@/components/features/dashboard/welcome-header";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/dashboard/use-dashboard";

export default function DashboardPage() {
  const { userName, stats, courses, isLoading, isError, isEmpty, errorMessage, refetch } =
    useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-3xl border border-red-100 bg-red-50/50 p-8 text-center dark:border-red-900/30 dark:bg-red-950/20">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{errorMessage}</p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="rounded-xl border-red-200 text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="mr-2 size-4" />
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <WelcomeHeader userName={userName} courseCount={courses.length} />
      <StatsSummary items={stats} />

      <div className="space-y-4">
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Devam Eden Kurslar
        </h3>
        {isEmpty ? (
          <EmptyCoursesState />
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {courses.map((course) => (
              <CourseProgressCard key={course.course_id} course={course} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
