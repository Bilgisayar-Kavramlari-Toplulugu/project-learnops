"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { SectionProgressItem } from "@/types";

// ---------------------------------------------------------------------------
// GET /enrollments/{courseId}/progress  (BE-17)
// Her section'ın completed durumu ve genel progress_percent döner.
// Backend hazır olana kadar 404/500 → boş array ile graceful fallback.
// ---------------------------------------------------------------------------
export function useSectionProgress(courseId: string) {
  return useQuery<SectionProgressItem[]>({
    queryKey: queryKeys.progress.byCourse(courseId),
    queryFn: async () => {
      const { data } = await api.get<SectionProgressItem[]>(`/enrollments/${courseId}/progress`);
      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    placeholderData: [],
  });
}

// ---------------------------------------------------------------------------
// POST /progress/sections/{sectionIdStr}/complete  (BE-16)
// Section tamamlandığında progress_percent ve completed_at güncellenir.
// Optimistic update: backend gelmeden önce UI anında tepki verir.
// ---------------------------------------------------------------------------
export function useMarkSectionComplete(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sectionIdStr: string) => {
      const { data } = await api.post<SectionProgressItem>(
        `/progress/sections/${sectionIdStr}/complete`,
      );
      return data;
    },

    onMutate: async (sectionIdStr: string) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.progress.byCourse(courseId),
      });

      const previous = queryClient.getQueryData<SectionProgressItem[]>(
        queryKeys.progress.byCourse(courseId),
      );

      // Anında cache'e yaz (optimistic)
      queryClient.setQueryData<SectionProgressItem[]>(
        queryKeys.progress.byCourse(courseId),
        (old = []) => {
          const exists = old.some((p) => p.section_id_str === sectionIdStr);
          if (exists) {
            return old.map((p) =>
              p.section_id_str === sectionIdStr ? { ...p, completed: true } : p,
            );
          }
          return [...old, { section_id_str: sectionIdStr, completed: true }];
        },
      );

      return { previous };
    },

    // Backend henüz yoksa rollback yapma — UI tepkisi korunsun.
    // TODO(BE-16 stabilize olunca): hata durumunda cache rollback ekle;
    // aksi hâlde sidebar yanlış completed state göstermeye devam edebilir.
    onError: () => {},

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.progress.byCourse(courseId),
      });
    },
  });
}
