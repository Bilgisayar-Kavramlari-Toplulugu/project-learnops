"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Clock, Trophy, RotateCcw, Home, History } from "lucide-react";

// onViewHistory — BE-20 (Sprint 6) tamamlandı. Frontend sayfası FE-24 (Sprint 7)
// kapsamında aktive edilecek.

interface AnswerResult {
  question_id: string;
  question_text: string;
  selected_index: number | null;
  correct_index: number;
  is_correct: boolean;
  explanation: string | null;
  options: string[];
}

interface QuizResultScreenProps {
  score: number;
  totalQuestions: number;
  passed: boolean;
  timeSpentSecs: number;
  answers: AnswerResult[];
  onRetry?: () => void;
  onBackToCourse?: () => void;
  onViewHistory?: () => void;
}

// Renk şeması (story'den) — hex kodları
const COLORS = {
  correct: {
    bg: "bg-[#DCFCE7]",
    border: "border-[#BBF7D0]",
    text: "text-[#166534]",
    icon: "text-[#16A34A]",
    badge: "bg-[#DCFCE7] text-[#166534]",
  },
  incorrect: {
    bg: "bg-[#FEE2E2]",
    border: "border-[#FECACA]",
    text: "text-[#991B1B]",
    icon: "text-[#DC2626]",
    badge: "bg-[#FEE2E2] text-[#991B1B]",
  },
  unanswered: {
    bg: "bg-[#FEF9C3]",
    border: "border-[#FEF08A]",
    text: "text-[#854D0E]",
    icon: "text-[#CA8A04]",
    badge: "bg-[#FEF9C3] text-[#854D0E]",
  },
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getAnswerStyle(isCorrect: boolean, selectedIndex: number | null) {
  if (selectedIndex === null) {
    return COLORS.unanswered;
  }
  return isCorrect ? COLORS.correct : COLORS.incorrect;
}

export function QuizResultScreen({
  score,
  totalQuestions,
  passed,
  timeSpentSecs,
  answers,
  onRetry,
  onBackToCourse,
  onViewHistory,
}: QuizResultScreenProps) {
  const router = useRouter();

  const correctCount = answers.filter((a) => a.is_correct).length;
  const incorrectCount = answers.filter((a) => !a.is_correct && a.selected_index !== null).length;
  const unansweredCount = answers.filter((a) => a.selected_index === null).length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.refresh();
    }
  };

  const handleBackToCourse = () => {
    if (onBackToCourse) {
      onBackToCourse();
    } else {
      router.back();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-4 lg:p-6">
      {/* Özet Kartı */}
      <div
        className={`rounded-2xl border p-6 ${
          passed
            ? "border-[#BBF7D0] bg-[#DCFCE7]/50 dark:border-[#16A34A]/20 dark:bg-[#16A34A]/5"
            : "border-[#FECACA] bg-[#FEE2E2]/50 dark:border-[#DC2626]/20 dark:bg-[#DC2626]/5"
        }`}
      >
        <div className="flex items-center gap-4">
          {/* İkon */}
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              passed ? "bg-[#DCFCE7] dark:bg-[#16A34A]/20" : "bg-[#FEE2E2] dark:bg-[#DC2626]/20"
            }`}
          >
            {passed ? (
              <Trophy className="h-8 w-8 text-[#16A34A] dark:text-[#4ADE80]" />
            ) : (
              <XCircle className="h-8 w-8 text-[#DC2626] dark:text-[#F87171]" />
            )}
          </div>

          {/* Bilgiler */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#111827] dark:text-[#F9FAFB]">
              {passed ? "Tebrikler!" : "Üzgünüm"}
            </h2>
            <p className="text-[#4B5563] dark:text-[#D1D5DB]">
              {passed ? "Sınavı başarıyla geçtin!" : "Sınavı geçmek için yeterli puan alamadın."}
            </p>
          </div>

          {/* Skor */}
          <div className="text-right">
            <div className="text-4xl font-extrabold text-[#111827] dark:text-[#F9FAFB]">
              {percentage}%
            </div>
            <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              {score}/{totalQuestions} doğru
            </div>
            <div className="mt-1 text-xs font-medium">
              {passed ? (
                <span className="text-[#16A34A] dark:text-[#4ADE80]">Geçti ✓</span>
              ) : (
                <span className="text-[#DC2626] dark:text-[#F87171]">Kaldı ✗</span>
              )}
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="mt-6 flex flex-wrap gap-4 border-t border-[#E5E7EB] pt-4 dark:border-[#374151]">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#6B7280]" />
            <span className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">
              Süre: {timeSpentSecs && timeSpentSecs > 0 ? formatTime(timeSpentSecs) : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
            <span className="text-sm font-medium text-[#166534] dark:text-[#4ADE80]">
              {correctCount} Doğru
            </span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-[#DC2626]" />
            <span className="text-sm font-medium text-[#991B1B] dark:text-[#F87171]">
              {incorrectCount} Yanlış
            </span>
          </div>
          {unansweredCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-[#EAB308]" />
              <span className="text-sm font-medium text-[#854D0E] dark:text-[#FACC15]">
                {unansweredCount} Cevapsız
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Soru Kartları */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB]">Soru Detayları</h3>
        {answers.map((answer, index) => {
          const style = getAnswerStyle(answer.is_correct, answer.selected_index);
          return (
            <div
              key={answer.question_id}
              className={`rounded-xl border p-4 ${style.bg} ${style.border}`}
            >
              <div className="flex items-start gap-3">
                {/* Durum İkonu */}
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#111827]">
                  {answer.selected_index === null ? (
                    <div className="h-3 w-3 rounded-full bg-[#EAB308]" />
                  ) : answer.is_correct ? (
                    <CheckCircle2 className={`h-4 w-4 ${style.icon}`} />
                  ) : (
                    <XCircle className={`h-4 w-4 ${style.icon}`} />
                  )}
                </div>

                {/* İçerik */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                      Soru {index + 1}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        answer.selected_index === null
                          ? "bg-[#FEF9C3] text-[#854D0E] dark:bg-[#854D0E]/30 dark:text-[#FACC15]"
                          : answer.is_correct
                            ? "bg-[#DCFCE7] text-[#166534] dark:bg-[#166534]/30 dark:text-[#4ADE80]"
                            : "bg-[#FEE2E2] text-[#991B1B] dark:bg-[#991B1B]/30 dark:text-[#F87171]"
                      }`}
                    >
                      {answer.selected_index === null
                        ? "Cevapsız"
                        : answer.is_correct
                          ? "Doğru"
                          : "Yanlış"}
                    </span>
                  </div>

                  {/* Soru metni */}
                  <p className="mt-1 text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
                    {answer.question_text}
                  </p>

                  {/* Kullanıcının cevabı (vurgulanmış) */}
                  <p className="mt-2 text-sm text-[#4B5563] dark:text-[#D1D5DB]">
                    <span className="font-medium">Senin cevabın: </span>
                    {answer.selected_index !== null
                      ? answer.options[answer.selected_index]
                      : "Cevap verilmedi"}
                  </p>

                  {/* Cevapsız durumunda not */}
                  {answer.selected_index === null && (
                    <p className="mt-2 text-sm text-[#854D0E] dark:text-[#FACC15]">
                      Süre dolmadan önce bu soruya cevap verilemedi.
                    </p>
                  )}

                  {/* Yanlış cevap durumunda doğru cevabı göster */}
                  {!answer.is_correct && answer.selected_index !== null && (
                    <p className="mt-2 text-sm text-[#991B1B] dark:text-[#FCA5A5]">
                      <span className="font-semibold">Doğru cevap: </span>
                      {answer.options[answer.correct_index]}
                    </p>
                  )}

                  {/* Açıklama varsa göster */}
                  {answer.explanation && (
                    <p className="mt-2 text-sm text-[#4B5563] dark:text-[#D1D5DB]">
                      {answer.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Aksiyon Butonları */}
      <div className="flex flex-wrap gap-3 border-t border-[#E5E7EB] pt-4 dark:border-[#374151]">
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#4F46E5]/20 hover:bg-[#4338CA] active:scale-[0.97]"
        >
          <RotateCcw className="h-4 w-4" />
          Tekrar Dene
        </button>
        <button
          onClick={handleBackToCourse}
          className="inline-flex items-center gap-2 rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm font-bold text-[#374151] hover:bg-[#F3F4F6] dark:border-[#4B5563] dark:bg-[#1F2937] dark:text-[#D1D5DB] dark:hover:bg-[#374151]"
        >
          <Home className="h-4 w-4" />
          Kursa Dön
        </button>
        {onViewHistory && (
          <button
            onClick={onViewHistory}
            className="inline-flex items-center gap-2 rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm font-bold text-[#374151] hover:bg-[#F3F4F6] dark:border-[#4B5563] dark:bg-[#1F2937] dark:text-[#D1D5DB] dark:hover:bg-[#374151]"
          >
            <History className="h-4 w-4" />
            Geçmiş Denemeler
          </button>
        )}
      </div>
    </div>
  );
}
