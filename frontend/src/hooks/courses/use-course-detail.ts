"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { CourseDetail } from "@/types";

export function useCourseDetail(slug: string) {
  return useQuery({
    queryKey: queryKeys.courses.detail(slug),
    queryFn: async () => {
      const { data } = await api.get<CourseDetail>(`/courses/${slug}`);
      return data;
    },
    enabled: Boolean(slug),
    staleTime: Infinity,
  });
}
