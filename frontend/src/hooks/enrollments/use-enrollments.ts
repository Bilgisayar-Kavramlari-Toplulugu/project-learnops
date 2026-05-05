// hooks/enrollments/use-enrollments.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getEnrolledCourses } from "@/services/enrollment.service";
import { queryKeys } from "@/lib/query-keys";

export function useEnrollments() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.enrollments.list(),
    queryFn: getEnrolledCourses,
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