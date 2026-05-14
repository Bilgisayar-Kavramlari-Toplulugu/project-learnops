// hooks/enrollments/use-enrollments.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getEnrolledCourses } from "@/services/enrollment.service";
import { queryKeys } from "@/lib/query-keys";
import axios from "axios";
interface UseEnrollmentsOptions {
  enabled?: boolean;
}

export function useEnrollments({ enabled = true }: UseEnrollmentsOptions = {}) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.enrollments.list(),
    queryFn: getEnrolledCourses,
    enabled,
    staleTime: 60_000,
    retry: 1,
  });
  const errorMessage = axios.isAxiosError(error)
    ? (error.response?.data?.detail ??
      error.message ??
      "Kurs bilgileri yüklenirken bir hata oluştu.")
    : error instanceof Error
      ? error.message
      : "Kurs bilgileri yüklenirken bir hata oluştu.";
  return {
    enrollments: data ?? [],
    isLoading,
    isError,
    isEmpty: !isLoading && !isError && (data ?? []).length === 0,
    error,
    errorMessage,
    refetch,
  };
}
