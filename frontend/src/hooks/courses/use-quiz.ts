import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { QuizMeta, QuizSession } from "@/types";

/**
 * Adım 1 — GET /courses/{slug}/quiz
 *
 * Quiz meta bilgisini döndürür: quiz_id, soru sayısı, süre, geçme notu.
 * Attempt başlatmak için quiz_id gereklidir.
 * staleTime: Infinity → meta değişmez, cache'den servis edilir.
 */
export function useQuizMeta(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.quiz.meta(slug ?? ""),
    queryFn: async () => {
      const { data } = await api.get<QuizMeta>(`/courses/${slug}/quiz`);
      return data;
    },
    enabled: Boolean(slug),
    staleTime: Infinity,
    retry: false,
  });
}

/**
 * Adım 2 — POST /quizzes/{quizId}/attempts
 *
 * Yeni quiz attempt başlatır. Sorular randomize sırayla,
 * correct_index GÖNDERİLMEZ (TC-SEC-01).
 * Mutation çünkü her "başla" tıklaması yeni bir attempt oluşturur.
 */
export function useStartAttempt() {
  return useMutation({
    mutationFn: async (quizId: string): Promise<QuizSession> => {
      const { data } = await api.post<QuizSession>(`/quizzes/${quizId}/attempts`);
      return data;
    },
  });
}
