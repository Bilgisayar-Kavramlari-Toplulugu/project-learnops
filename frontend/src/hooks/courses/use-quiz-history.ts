import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { QuizAttemptHistoryItem } from "@/types";

/**
 * GET /quiz-attempts?quiz_id={quizId}
 *
 * Kullanıcının belirli bir quiz için tüm geçmiş attemptlarını döndürür.
 * Sonuç ekranında geçmiş denemeler butonu için kullanılır (TC-QUIZ-12).
 * staleTime: 0 → her submit sonrası güncel liste gösterilir.
 * retry: false → geçici hata durumunda üç deneme yerine hata hemen işlenir;
 *   history ikincil özellik olduğundan sessiz hata yeterlidir.
 */
export function useQuizHistory(quizId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.quiz.history(quizId ?? ""),
    queryFn: async () => {
      const { data } = await api.get<QuizAttemptHistoryItem[]>(
        `/quiz-attempts?quiz_id=${quizId}`,
      );
      return data;
    },
    enabled: Boolean(quizId),
    staleTime: 0,
    retry: false,
  });
}
