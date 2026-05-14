"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { CourseProgressCard } from "@/components/features/dashboard/course-progress-card";
import { DashboardSkeleton } from "@/components/features/dashboard/dashboard-skeleton";
import { EmptyCoursesState } from "@/components/features/dashboard/empty-courses-state";
import { StatsSummary } from "@/components/features/dashboard/stats-summary";
import { WelcomeHeader } from "@/components/features/dashboard/welcome-header";
import { LastQuizResult } from "@/components/features/dashboard/last-quiz-result";
import { Button } from "@/components/ui";
import { useDashboard } from "@/hooks/dashboard/use-dashboard";
import { CompletedCoursesSection } from "@/components/features/dashboard/completed-courses-section";
import { useEnrollments } from "@/hooks/enrollments/use-enrollments";
export default function DashboardPage() {
  const {
    userName,
    stats,
    courses,
    isLoading,
    lastQuizResult,
    isError,
    errorMessage,
    avatarType,
    refetch,
  } = useDashboard();
  const { enrollments, isLoading: isEnrollmentsLoading } = useEnrollments();
  const [showSkeleton, setShowSkeleton] = useState(false);
  const pageLoading = isLoading || isEnrollmentsLoading;
  const completedCourses = enrollments.filter(
    (item) => item.completed_at || item.progress_percent >= 100,
  );

  const hasAnyDashboardData =
    courses.length > 0 || completedCourses.length > 0 || Boolean(lastQuizResult);
  useEffect(() => {
    const timer = setTimeout(
      () => {
        setShowSkeleton(pageLoading);
      },
      pageLoading ? 300 : 0,
    );

    return () => clearTimeout(timer);
  }, [pageLoading]);

  if (pageLoading && showSkeleton) return <DashboardSkeleton />;
  if (pageLoading && !showSkeleton) return null;

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
      <WelcomeHeader userName={userName} courseCount={courses.length} avatarType={avatarType} />

      {!hasAnyDashboardData ? (
        <EmptyCoursesState />
      ) : (
        <>
          <StatsSummary items={stats} />

          {lastQuizResult && <LastQuizResult result={lastQuizResult} />}

          {courses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Devam Eden Kurslar
              </h3>
              <div className="grid gap-5 xl:grid-cols-2">
                {courses.map((course) => (
                  <CourseProgressCard key={course.course_id} course={course} />
                ))}
              </div>
            </div>
          )}

          <CompletedCoursesSection courses={completedCourses} />
        </>
      )}
    </section>
  );
}
