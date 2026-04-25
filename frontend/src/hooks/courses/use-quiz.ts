"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { QuizSession } from "@/types";

/**
 * GET /courses/{courseId}/quiz
 *
 * Her mount'ta backend'den taze veri alınır (started_at buradan hesaplanır).
 * Timer localStorage'da saklanmaz — FE-13 kabul kriteri.
 *
 * staleTime: 0 → sayfa yenilenince backend'den tekrar istek yapılır,
 * ancak aynı session_id için React Query cache devreye girmez çünkü
 * `started_at` değişmemelidir (backend aynı session_id'yi döner).
 */
export function useQuiz(courseId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.quiz.session(courseId ?? ""),
    queryFn: async () => {
      const { data } = await api.get<QuizSession>(`/courses/${courseId}/quiz`);
      return data;
    },
    enabled: Boolean(courseId),
    staleTime: 0, // Timer doğruluğu için her mount'ta backend'e gidilir
    gcTime: 0, // Unmount'ta eski started_at cache'ini temizle; timer flicker önlenir
    refetchOnWindowFocus: false, // Odak değişiminde yeniden fetch yapılmasın
    retry: false, // Quiz session hataları sessizce yutulmasın
  });
}
