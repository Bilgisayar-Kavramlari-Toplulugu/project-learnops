"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Clock, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import type { AxiosError } from "axios";

import { useCourseDetail } from "@/hooks/courses/use-course-detail";
import { useQuizMeta, useStartAttempt } from "@/hooks/courses/use-quiz";
import { useQuizHistory } from "@/hooks/courses/use-quiz-history";
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

// ─── Sonuç Ekranı ──────────────────────────────────────────────────────────────

function QuizResultScreen({
  result,
  onBack,
  onRetry,
}: {
  result: QuizResult;
  onBack: () => void;
  onRetry: () => void;
}) {
  const { data: history = [] } = useQuizHistory(result.quiz_id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle
          className={result.passed ? "text-emerald-500" : "text-red-500"}
          size={64}
        />
        <h2 className="text-2xl font-bold">
          {result.passed ? "Tebrikler!" : "Bir Dahaki Sefere!"}
        </h2>
        <p className="text-muted-foreground text-lg">
          {result.score} / {result.total_questions} doğru cevap
        </p>
        <div className="flex gap-3">
          <Button onClick={onRetry}>Tekrar Dene</Button>
          <Button onClick={onBack} variant="outline">
            Kursa Dön
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {result.answers.map((answer) => {
          const isUnanswered = answer.selected_index === null;
          const bgColor = answer.is_correct
            ? "bg-[#DCFCE7] dark:bg-emerald-900/20"
            : isUnanswered
              ? "bg-[#FEF9C3] dark:bg-yellow-900/20"
              : "bg-[#FEE2E2] dark:bg-red-900/20";
          const selectedText =
            answer.selected_index !== null
              ? answer.options.find((o) => o.index === answer.selected_index)?.text
              : null;
          const correctText = answer.options.find(
            (o) => o.index === answer.correct_index,
          )?.text;

          return (
            <div key={answer.question_id} className={`rounded-xl p-4 ${bgColor}`}>
              <p className="mb-2 font-medium">{answer.question_text}</p>
              {answer.is_correct && (
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  ✓ {selectedText}
                </p>
              )}
              {!answer.is_correct && !isUnanswered && (
                <>
                  <p className="text-sm text-red-600 line-through dark:text-red-400">
                    ✗ {selectedText}
                  </p>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                    Doğru: {correctText}
                  </p>
                </>
              )}
              {isUnanswered && (
                <>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    --- Cevaplanmadı
                  </p>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                    Doğru: {correctText}
                  </p>
                </>
              )}
              {answer.explanation && (
                <p className="mt-2 text-xs italic text-zinc-500">{answer.explanation}</p>
              )}
            </div>
          );
        })}
      </div>

      {history.length > 1 && (
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">
            Geçmiş Denemeler
          </h3>
          <div className="flex flex-col gap-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-2 text-sm dark:border-zinc-800"
              >
                <span className="text-zinc-500">
                  {new Date(item.submitted_at).toLocaleDateString("tr-TR")}
                </span>
                <span className="font-medium">
                  {item.score}/{item.total_questions}
                </span>
                <span className={item.passed ? "text-emerald-600" : "text-red-500"}>
                  {item.passed ? "Geçti ✓" : "Kaldı ✗"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Ana Bileşen ───────────────────────────────────────────────────────────────

export default function QuizClient({ slug }: QuizClientProps) {
  const router = useRouter();

  // useCourseDetail: loading/error state'i için tutulur; course.id artık kullanılmıyor
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
  }, [quizMeta?.quiz_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 403 → kursa kayıtsız kullanıcıyı kurs detay sayfasına yönlendir
  useEffect(() => {
    if (sessionError) {
      const httpStatus = (sessionErrorRaw as AxiosError)?.response?.status;
      if (httpStatus === 403) {
        toast.error("Bu kursa kayıtlı değilsiniz.");
        router.push(routes.courseDetail(slug));
      }
    }
  }, [sessionError]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Local State ───────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({}); // questionId → optionIndex
  const [remaining, setRemaining] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hasSubmittedRef = useRef(false); // Çift submit önleyici
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      if (intervalRef.current) clearInterval(intervalRef.current);
      hasSubmittedRef.current = true;
      // Ham sonucu zenginleştir: her cevaba soru metni ve seçenekleri ekle
      const enriched: QuizResult = {
        ...raw,
        quiz_id: session!.quiz_id,
        answers: raw.answers.map((a) => {
          const q = session!.questions.find((q) => q.id === a.question_id);
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

    // setTimeout(0): ilk değeri bir sonraki event loop tick'te hesapla
    const initTimer = setTimeout(tick, 0);
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      clearTimeout(initTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session]); // answers değişiminde interval yeniden başlamaz

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
        <p className="text-muted-foreground">Kurs bilgisi yüklenirken bir hata oluştu.</p>
        <Button variant="outline" onClick={() => router.push(routes.courseDetail(slug))}>
          Kursa Dön
        </Button>
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-muted-foreground">Sınav yüklenirken bir hata oluştu.</p>
        <Button variant="outline" onClick={() => router.push(routes.courseDetail(slug))}>
          Kursa Dön
        </Button>
      </div>
    );
  }

  // ─── Sonuç Ekranı ──────────────────────────────────────────────────────────
  if (quizResult) {
    return (
      <QuizResultScreen
        result={quizResult}
        onBack={() => router.push(routes.courseDetail(slug))}
        onRetry={handleRetry}
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
