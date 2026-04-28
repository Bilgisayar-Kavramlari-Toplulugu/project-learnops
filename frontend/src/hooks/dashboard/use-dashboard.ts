// hooks/dashboard/use-dashboard.ts
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { getDashboardSummary } from "@/lib/fetchDashboard";
import { queryKeys } from "@/lib/query-keys";
import type { DashboardStatSummaryItem, DashboardSummaryResponse } from "@/types";

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildStats(data: DashboardSummaryResponse | undefined): DashboardStatSummaryItem[] {
  const inProgressCount = data?.in_progress_courses?.length ?? 0;
  const completedCount = data?.completed_course_count ?? 0;

  const averageProgress =
    inProgressCount > 0
      ? clampProgress(
          (data?.in_progress_courses ?? []).reduce((sum, c) => sum + c.progress_percent, 0) /
            inProgressCount,
        )
      : 0;

  return [
    {
      key: "in_progress_courses",
      label: "Devam Eden",
      value: `${inProgressCount}`,
      description: "Aktif olarak takip ettiğin kurslar",
    },
    {
      key: "completed_courses",
      label: "Tamamlanan",
      value: `${completedCount}`,
      description: "Bitirdiğin kurs sayısı",
    },
    {
      key: "average_progress",
      label: "Ortalama İlerleme",
      value: `%${averageProgress}`,
      description: "Devam eden kurslarındaki genel ilerleme",
    },
  ];
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    return detail ?? "Dashboard verisi yüklenemedi.";
  }
  return "Dashboard verisi yüklenemedi.";
}

export function useDashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: getDashboardSummary,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
  });

  const stats = useMemo(() => buildStats(data), [data]);

  const courses = useMemo(
    () =>
      (data?.in_progress_courses ?? []).map((course) => ({
        ...course,
        progress_percent: clampProgress(course.progress_percent),
      })),
    [data?.in_progress_courses],
  );

  return {
    userName: data?.display_name?.trim() || "Öğrenci", // profile'dan değil buradan geliyor artık
    stats,
    courses,
    lastQuizResult: data?.last_quiz_result ?? null,
    isLoading,
    isError,
    isEmpty: !isLoading && !isError && courses.length === 0,
    errorMessage: error ? getErrorMessage(error) : undefined,
    avatarType: data?.avatar_type ?? null,
    refetch,
  };
}
