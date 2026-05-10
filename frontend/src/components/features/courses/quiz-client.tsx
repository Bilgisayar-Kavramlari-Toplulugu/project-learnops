"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { AxiosError } from "axios";

import { useCourseDetail } from "@/hooks/courses/use-course-detail";
import { useQuizMeta, useStartAttempt } from "@/hooks/courses/use-quiz";
import { useQuizHistory } from "@/hooks/courses/use-quiz-history";
import { QuizResultScreen } from "@/components/quiz/quiz-result-screen";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  toast,
} from "@/components/ui";
import type {
  QuizAnswer,
  QuizResult,
  QuizResultRaw,
  QuizSubmitPayload,
} from "@/types";

interface QuizClientProps {
  slug: string;
}

// ─── Timer Yardımcısı ──────────────────────────────────────────────────────────

function calcRemaining(startedAt: string, durationSeconds: number): number {
  const elapsedMs = Date.now() - new Date(startedAt).getTime();
  const elapsedSec = Math.floor(elapsedMs / 1000);
  return Math.max(0, durationSeconds - elapsedSec);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Ana Bileşen ───────────────────────────────────────────────────────────────

export default function QuizClient({ slug }: QuizClientProps) {
  const router = useRouter();

  // useCourseDetail: yalnızca loading/error state yönetimi için
  const { isLoading: courseLoading, isError: courseError } = useCourseDetail(slug);

  const { data: quizMeta, isLoading: metaLoading, isError: metaError } =
    useQuizMeta(slug);

  const {
    mutate: startAttempt,
    data: session,
    isPending: sessionLoading,
    isError: sessionError,
    error: sessionErrorRaw,
  } = useStartAttempt();

  // ─── Attempt Başlatma ──────────────────────────────────────────────────────
  const attemptStartedRef = useRef(false);

  useEffect(() => {
    if (quizMeta?.quiz_id && !attemptStartedRef.current) {
      attemptStartedRef.current = true;
      startAttempt(quizMeta.quiz_id);
    }
    // startAttempt: useMutation tarafından sağlanan fonksiyon render'lar arası stabil
  }, [quizMeta?.quiz_id, startAttempt]);

  // 403 → kursa kayıtsız kullanıcıyı kurs detay sayfasına yönlendir
  useEffect(() => {
    if (sessionError) {
      const httpStatus = (sessionErrorRaw as AxiosError)?.response?.status;
      if (httpStatus === 403) {
        toast.error("Bu kursa kayıtlı değilsiniz.");
        router.push(routes.courseDetail(slug));
      }
    }
  }, [sessionError, sessionErrorRaw, router, slug]);

  // ─── Local State ───────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({}); // questionId → optionIndex
  const [remaining, setRemaining] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hasSubmittedRef = useRef(false); // Çift submit önleyici
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Geçmiş (TC-QUIZ-12) ───────────────────────────────────────────────────
  // Hook kuralı gereği top-level'da çağrılır; quizResult yokken devre dışı kalır
  const { data: attemptHistory = [] } = useQuizHistory(quizResult?.quiz_id);

  // ─── Submit Mutation ───────────────────────────────────────────────────────
  const { mutate: submitQuiz, isPending: isSubmitting } = useMutation({
    mutationFn: async (payload: QuizSubmitPayload) => {
      const { data } = await api.post<QuizResultRaw>(
        `/quiz-attempts/${session!.id}/submit`,
        payload,
      );
      return data;
    },
    onSuccess: (raw) => {
      // session her zaman tanımlı olmalı (attempt başlatılmadan submit olmaz)
      // ancak TypeScript güvenliği için guard eklenir
      if (!session) return;
      if (intervalRef.current) clearInterval(intervalRef.current);
      hasSubmittedRef.current = true;
      // Ham sonucu zenginleştir: her cevaba soru metni ve seçenekleri ekle
      const enriched: QuizResult = {
        ...raw,
        quiz_id: session.quiz_id,
        answers: raw.answers.map((a) => {
          const q = session.questions.find((q) => q.id === a.question_id);
          if (!q) {
            console.error(`[quiz] question_id ${a.question_id} session'da bulunamadı`);
          }
          return { ...a, question_text: q?.text ?? "", options: q?.options ?? [] };
        }),
      };
      setQuizResult(enriched);
    },
    onError: () => {
      hasSubmittedRef.current = false; // Hata durumunda retry'a izin ver
      toast.error("Sınav gönderilemedi", {
        description: "Lütfen tekrar deneyin.",
      });
    },
  });

  const handleSubmit = useCallback(
    (isAutoSubmit = false) => {
      if (hasSubmittedRef.current || !session) return;
      hasSubmittedRef.current = true;

      if (isAutoSubmit) {
        toast.info("Süre doldu", {
          description: "Sınavın otomatik olarak gönderildi.",
        });
      }

      // Tüm sorular gönderilir; cevaplanmayanlar selected_index: null
      const answerPayload: QuizAnswer[] = session.questions.map((q) => ({
        question_id: q.id,
        selected_index: answers[q.id] !== undefined ? answers[q.id] : null,
      }));

      submitQuiz({ answers: answerPayload });
    },
    [session, answers, submitQuiz],
  );

  // ─── Tekrar Dene ───────────────────────────────────────────────────────────
  function handleRetry() {
    setQuizResult(null);
    setAnswers({});
    setCurrentIndex(0);
    setRemaining(null); // Timer'ı sıfırla — yeni session yüklenene kadar --:-- göster
    hasSubmittedRef.current = false;
    attemptStartedRef.current = false;
    if (quizMeta?.quiz_id) {
      attemptStartedRef.current = true;
      startAttempt(quizMeta.quiz_id);
    }
  }

  // ─── Timer ─────────────────────────────────────────────────────────────────
  // handleSubmit'in güncel referansını ref'te tut; timer effect'i sadece
  // session'a bağlı kalır — her cevap seçiminde interval yeniden başlamaz.
  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    if (!session) return;

    let submitted = false;

    const tick = () => {
      const r = calcRemaining(session.started_at, session.duration_seconds);
      setRemaining(r);
      if (r <= 0 && !submitted) {
        submitted = true;
        handleSubmitRef.current(true);
      }
    };

    const initTimer = setTimeout(tick, 0);
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      clearTimeout(initTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session]);

  // ─── Loading / Error States ────────────────────────────────────────────────
  if (
    courseLoading ||
    metaLoading ||
    sessionLoading ||
    (!session && !sessionError && !metaError)
  ) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground animate-pulse">Sınav yükleniyor…</p>
      </div>
    );
  }

  if (courseError || metaError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-muted-foreground">Sınav bilgisi yüklenirken bir hata oluştu.</p>
        <Button variant="outline" onClick={() => router.push(routes.courseDetail(slug))}>
          Kursa Dön
        </Button>
      </div>
    );
  }

  // B-01: 403 dışındaki session hataları (500, ağ kesilmesi vb.)
  // 403 zaten yukarıdaki useEffect ile yönetilir ve yönlendirme başlatır.
  if (sessionError && (sessionErrorRaw as AxiosError)?.response?.status !== 403) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-muted-foreground">
          Sınav başlatılırken bir hata oluştu. Lütfen sayfayı yenileyiniz.
        </p>
        <Button variant="outline" onClick={() => router.push(routes.courseDetail(slug))}>
          Kursa Dön
        </Button>
      </div>
    );
  }

  if (!session) {
    const is403 = (sessionErrorRaw as AxiosError)?.response?.status === 403;
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground animate-pulse">
          {is403 ? "Yönlendiriliyor…" : "Sınav yüklenirken bir hata oluştu."}
        </p>
      </div>
    );
  }

  // ─── Sonuç Ekranı ──────────────────────────────────────────────────────────
  if (quizResult) {
    // Canonical QuizResultScreen options: string[] bekliyor; QuizOption[] → string[] dönüşümü
    const mappedAnswers = quizResult.answers.map((a) => ({
      ...a,
      explanation: a.explanation ?? null,
      options: a.options.map((o) => o.text),
    }));

    return (
      <QuizResultScreen
        score={quizResult.score}
        totalQuestions={quizResult.total_questions}
        passed={quizResult.passed}
        timeSpentSecs={quizResult.time_spent_secs}
        answers={mappedAnswers}
        onRetry={handleRetry}
        onBackToCourse={() => router.push(routes.courseDetail(slug))}
        // TC-QUIZ-12: 2+ attempt varsa geçmiş butonu gösterilir
        onViewHistory={
          attemptHistory.length > 1
            ? () => router.push(`/quiz/${quizResult.quiz_id}/results?attemptId=${quizResult.attempt_id}`)
            : undefined
        }
      />
    );
  }

  const questions = session.questions;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLast = currentIndex === totalQuestions - 1;
  const isTimeCritical = remaining !== null && remaining < 60;
  const answeredCount = Object.keys(answers).length;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      {/* Üst Bar: Soru no + Timer */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">
          Soru {currentIndex + 1} / {totalQuestions}
        </span>

        {/* Geri Sayım */}
        <div
          role="timer"
          aria-label={`Kalan süre: ${remaining !== null ? formatTime(remaining) : "yükleniyor"}`}
          aria-live="off"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-mono font-semibold transition-colors ${
            isTimeCritical
              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <Clock size={14} />
          <span>{remaining !== null ? formatTime(remaining) : "--:--"}</span>
        </div>
      </div>

      {/* İlerleme Çubuğu — cevaplanan soru sayısını gösterir */}
      <Progress value={(answeredCount / totalQuestions) * 100} className="h-1.5" />

      {/* Soru Kartı */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium leading-relaxed">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.index;
            return (
              <Button
                key={option.index.toString()}
                type="button"
                variant="outline"
                onClick={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.id]: option.index,
                  }))
                }
                className={`h-auto justify-start rounded-lg px-4 py-3 text-left text-sm whitespace-normal ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:bg-accent hover:text-accent-foreground"
                }`}
                disabled={isSubmitting}
              >
                {option.text}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Alt Navigasyon */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0 || isSubmitting}
        >
          <ChevronLeft size={16} />
          Önceki
        </Button>

        {isLast ? (
          <>
            <Button onClick={() => setConfirmOpen(true)} disabled={isSubmitting} size="sm">
              {isSubmitting ? "Gönderiliyor…" : "Sınavı Bitir"}
            </Button>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sınavı bitirmek istiyor musun?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Gönderilen sınav bir daha düzenlenemez.{" "}
                    {answeredCount < session.questions.length && (
                      <span className="font-medium text-orange-500">
                        {session.questions.length - answeredCount} soru cevaplanmadı.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Geri Dön</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setConfirmOpen(false);
                      handleSubmit(false);
                    }}
                  >
                    Evet, Gönder
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
            disabled={isSubmitting}
          >
            Sonraki
            <ChevronRight size={16} />
          </Button>
        )}
      </div>

      {/* Soru Genel Bakışı */}
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        {questions.map((q, i) => (
          <Button
            key={q.id}
            type="button"
            variant={i === currentIndex ? "default" : "secondary"}
            size="icon-sm"
            onClick={() => setCurrentIndex(i)}
            disabled={isSubmitting}
            aria-label={`Soru ${i + 1}'e git${answers[q.id] !== undefined ? " (cevaplandı)" : ""}`}
            className={`h-8 w-8 rounded-full text-xs font-semibold transition-colors ${
              i === currentIndex
                ? "bg-primary text-primary-foreground"
                : answers[q.id] !== undefined
                  ? "bg-emerald-500 text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {i + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}
