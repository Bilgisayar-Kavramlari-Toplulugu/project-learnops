"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import { QuizResultScreen } from "@/components/quiz/quiz-result-screen";
import { useEffect, useState } from "react";

interface AnswerResultItem {
  question_id: string;
  question_text: string;
  options: { index: number; text: string }[];
  selected_index: number | null;
  correct_index: number;
  is_correct: boolean;
  explanation: string | null;
}

interface QuizSubmitResponse {
  attempt_id: string;
  score: number;
  total_questions: number;
  passed: boolean;
  time_spent_secs: number;
  answers: AnswerResultItem[];
}

interface AnswerResult extends Omit<AnswerResultItem, "options"> {
  options: string[];
}

interface QuizResultData {
  attemptId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  timeSpentSecs: number;
  answers: AnswerResult[];
}

type LoadingState = "loading" | "success" | "error" | "not-found";

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const quizId = params.quizId as string;
  const attemptId = searchParams.get("attemptId");

  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [resultData, setResultData] = useState<QuizResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) {
      setLoadingState("not-found");
      return;
    }

    async function fetchResults() {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      try {
        const response = await fetch(`${API_URL}/quiz-attempts/${attemptId}`, {
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          if (response.status === 403) {
            setError("Bu sonuçlara erişim yetkiniz yok.");
            setLoadingState("error");
            return;
          }
          if (response.status === 404) {
            setLoadingState("not-found");
            return;
          }
          setError("Sonuçlar yüklenirken bir hata oluştu.");
          setLoadingState("error");
          return;
        }

        const data: QuizSubmitResponse = await response.json();

        // Backend'den gelen veriyi frontend formatına dönüştür
        const answers: AnswerResult[] = data.answers.map((answer) => ({
          question_id: answer.question_id,
          question_text: answer.question_text,
          selected_index: answer.selected_index,
          correct_index: answer.correct_index,
          is_correct: answer.is_correct,
          explanation: answer.explanation,
          options: answer.options.map((o) => o.text),
        }));

        setResultData({
          attemptId: data.attempt_id,
          score: data.score,
          totalQuestions: data.total_questions,
          passed: data.passed,
          timeSpentSecs: data.time_spent_secs,
          answers,
        });
        setLoadingState("success");
      } catch (err) {
        console.error("Error fetching quiz results:", err);
        setError("Sonuçlar yüklenirken bir hata oluştu.");
        setLoadingState("error");
      }
    }

    fetchResults();
  }, [attemptId, router]);

  const handleRetry = () => {
    router.push(`/quiz/${quizId}`);
  };

  const handleBackToCourse = () => {
    router.push(`/courses/${quizId}`);
  };

  const handleViewHistory = () => {
    router.push(`/quiz/${quizId}/history`);
  };

  // Loading state
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

  // Not found state
  if (loadingState === "not-found") {
    notFound();
  }

  // Error state
  if (loadingState === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold text-[#991B1B]">Hata</p>
          <p className="mt-2 text-sm text-[#4B5563]">{error || "Bir hata oluştu."}</p>
          <button
            onClick={handleRetry}
            className="mt-4 rounded-xl bg-[#4F46E5] px-4 py-2 text-sm font-bold text-white hover:bg-[#4338CA]"
          >
            Quiz'e Geri Dön
          </button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <QuizResultScreen
      score={resultData!.score}
      totalQuestions={resultData!.totalQuestions}
      passed={resultData!.passed}
      timeSpentSecs={resultData!.timeSpentSecs}
      answers={resultData!.answers}
      onRetry={handleRetry}
      onBackToCourse={handleBackToCourse}
      onViewHistory={handleViewHistory}
    />
  );
}