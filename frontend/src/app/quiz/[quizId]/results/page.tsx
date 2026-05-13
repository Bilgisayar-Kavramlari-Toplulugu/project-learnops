"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import { QuizResultScreen } from "@/components/quiz/quiz-result-screen";
import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";

interface AnswerResultItem {
  question_id: string;
  question_text: string;
  options: { index: number; text: string }[];
  selected_index: number | null;
  correct_index: number;
  is_correct: boolean;
  explanation: string | null;
}

// Backend field names — FIX BE-1 ile hizalandı (total_questions, time_spent_secs)
interface QuizAttemptDetailResponse {
  attempt_id: string;
  score: number;
  total_questions: number;
  passed: boolean;
  time_spent_secs?: number;
  course_slug?: string;
  answers: AnswerResultItem[];
}

interface AnswerResult extends Omit<AnswerResultItem, "options"> {
  options: string[];
}

interface QuizResultData {
  score: number;
  totalQuestions: number;
  passed: boolean;
  timeSpentSecs: number;
  answers: AnswerResult[];
  courseSlug?: string;
}

type LoadingState = "loading" | "success" | "error" | "not-found";

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const quizId = params.quizId as string;
  const attemptId = searchParams.get("attemptId");

  const [loadingState, setLoadingState] = useState<LoadingState>(
    attemptId ? "loading" : "not-found",
  );
  const [resultData, setResultData] = useState<QuizResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) return;

    async function fetchResults() {
      try {
        const response = await api.get<QuizAttemptDetailResponse>(`/quiz-attempts/${attemptId}`);
        const data = response.data;

        // Guard: total_questions 0 veya eksikse hata olarak işle
        const totalQs = data.total_questions;
        if (!totalQs || totalQs <= 0) {
          setError("Geçersiz quiz verisi alındı.");
          setLoadingState("error");
          return;
        }

        const timeSpent = data.time_spent_secs ?? 0;

        const answers: AnswerResult[] = data.answers.map((answer) => ({
          ...answer,
          options: answer.options.map((o) => o.text),
        }));

        setResultData({
          score: data.score,
          totalQuestions: totalQs,
          passed: data.passed,
          timeSpentSecs: timeSpent,
          answers,
          courseSlug: data.course_slug,
        });
        setLoadingState("success");
      } catch (err) {
        if (isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 401) {
            router.push(routes.login);
            return;
          }
          if (status === 403) {
            setError("Bu sonuçlara erişim yetkiniz yok.");
            setLoadingState("error");
            return;
          }
          if (status === 404) {
            setLoadingState("not-found");
            return;
          }
        }
        console.error("Error fetching quiz results:", err);
        setError("Sonuçlar yüklenirken bir hata oluştu.");
        setLoadingState("error");
      }
    }

    fetchResults();
  }, [attemptId, router]);

  // Handlers
  const handleRetry = () => router.push(`/quiz/${quizId}`);

  const handleBackToCourse = () => {
    router.push(
      resultData?.courseSlug ? routes.courseDetail(resultData.courseSlug) : routes.courses,
    );
  };

  // Loading UI
  if (loadingState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#4F46E5]" />
          <p className="mt-4 text-sm text-[#6B7280]">Sonuçlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Not Found
  if (loadingState === "not-found") notFound();

  // Error UI
  if (loadingState === "error" || !resultData) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold text-[#991B1B]">Hata</p>
          <p className="mt-2 text-sm text-[#4B5563]">{error || "Bir hata tespit edildi."}</p>
          <Button onClick={handleRetry} className="mt-4 rounded-xl text-sm font-bold">
            Quiz&apos;e Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  // Success UI
  return (
    <QuizResultScreen
      score={resultData.score}
      totalQuestions={resultData.totalQuestions}
      passed={resultData.passed}
      timeSpentSecs={resultData.timeSpentSecs}
      answers={resultData.answers}
      onRetry={handleRetry}
      onBackToCourse={handleBackToCourse}
    />
  );
}
