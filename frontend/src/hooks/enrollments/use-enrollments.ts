// hooks/enrollments/use-enrollments.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getEnrolledCourses } from "@/services/enrollment.service";
import { queryKeys } from "@/lib/query-keys";

interface UseEnrollmentsOptions {
  enabled?: boolean;
}

export function useEnrollments({ enabled = true }: UseEnrollmentsOptions = {}) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.enrollments.list(),
    queryFn: getEnrolledCourses,
    enabled,
    staleTime: 60_000,
    retry: 1,
  });

  return {
    enrollments: data ?? [],
    isLoading,
    isError,
    isEmpty: !isLoading && !isError && (data ?? []).length === 0,
    error,
  };
}
