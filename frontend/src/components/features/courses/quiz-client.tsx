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
import { useLogoutGuard } from "@/providers/logout-guard-provider";
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
import type { QuizAnswer, QuizResult, QuizResultRaw, QuizSubmitPayload } from "@/types";

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

  const { data: quizMeta, isLoading: metaLoading, isError: metaError } = useQuizMeta(slug);

  const {
    mutate: startAttempt,
    data: session,
    isPending,
    isError: sessionError,
    error: sessionErrorRaw,
  } = useStartAttempt();

  // ─── Attempt Başlatma ──────────────────────────────────────────────────────
  // Ref yerine mutation state kullanılır: session yoksa ve istek devam etmiyorsa
  // attempt başlat. Next.js freeze/thaw senaryosunda ref sıfırlanmaz ama
  // mutation data temizlenir; bu yaklaşım her iki durumu da doğru ele alır.
  useEffect(() => {
    if (quizMeta?.quiz_id && !session && !isPending && !sessionError) {
      startAttempt(quizMeta.quiz_id);
    }
  }, [quizMeta?.quiz_id, session, isPending, sessionError, startAttempt]);

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
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [remaining, setRemaining] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hasSubmittedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Logout guard: quiz aktifken logout isteği gelirse, submit sonrası çalıştırılır.
  const pendingLogoutRef = useRef<(() => void) | null>(null);
  const { registerGuard, unregisterGuard } = useLogoutGuard();

  // ─── Logout Guard ─────────────────────────────────────────────────────────
  // Quiz aktifken (session var, henüz submit edilmedi) logout guard'ı kaydet.
  useEffect(() => {
    if (session && !quizResult) {
      registerGuard((proceed) => {
        pendingLogoutRef.current = proceed;
        setConfirmOpen(true);
      });
    } else {
      unregisterGuard();
    }
  }, [session, quizResult, registerGuard, unregisterGuard]);

  // Unmount'ta guard'ı temizle.
  useEffect(() => () => unregisterGuard(), [unregisterGuard]);

  // ─── Geçmiş (TC-QUIZ-12) ───────────────────────────────────────────────────
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
      if (!session) return;
      if (intervalRef.current) clearInterval(intervalRef.current);
      hasSubmittedRef.current = true;
      unregisterGuard();
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

      // Quiz submit sonrası bekleyen logout varsa çalıştır.
      if (pendingLogoutRef.current) {
        pendingLogoutRef.current();
        pendingLogoutRef.current = null;
      }
    },
    onError: () => {
      hasSubmittedRef.current = false;
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
    setRemaining(null);
    hasSubmittedRef.current = false;
    if (quizMeta?.quiz_id) {
      // mutate() çağrısı TanStack Query'de önceki error/data/isPending state'ini
      // sıfırlar; bu sayede useEffect guard'ı yeni attempt'i başlatabilir.
      startAttempt(quizMeta.quiz_id);
    }
  }

  // ─── Timer ─────────────────────────────────────────────────────────────────
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
  if (courseLoading || metaLoading || isPending || (!session && !sessionError && !metaError)) {
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
    const mappedAnswers = quizResult.answers.map((a) => ({
      ...a,
      explanation: a.explanation ?? null,
      options: a.options.map((o) => o.text),
    }));

    return (
      <div className="flex flex-col">
        <QuizResultScreen
          score={quizResult.score}
          totalQuestions={quizResult.total_questions}
          passed={quizResult.passed}
          timeSpentSecs={quizResult.time_spent_secs}
          answers={mappedAnswers}
          onRetry={handleRetry}
          onBackToCourse={() => router.push(routes.courseDetail(slug))}
        />
        {attemptHistory.length > 1 && (
          <div className="mx-auto w-full max-w-2xl px-4 pb-8">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">
              Geçmiş Denemeler
            </h3>
            <div className="flex flex-col gap-2">
              {attemptHistory.map((item) => (
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

  // ─── Quiz Render ───────────────────────────────────────────────────────────
  const questions = session.questions;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLast = currentIndex === totalQuestions - 1;
  const isTimeCritical = remaining !== null && remaining < 60;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">
          Soru {currentIndex + 1} / {totalQuestions}
        </span>
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

      <Progress value={(answeredCount / totalQuestions) * 100} className="h-1.5" />

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
                variant={isSelected ? "selected" : "outline"}
                onClick={() =>
                  setAnswers((prev) => {
                    if (prev[currentQuestion.id] === option.index) {
                      const next = { ...prev };
                      delete next[currentQuestion.id];
                      return next;
                    }
                    return { ...prev, [currentQuestion.id]: option.index };
                  })
                }
                className="h-auto justify-start rounded-lg px-4 py-3 text-left text-sm whitespace-normal"
                disabled={isSubmitting}
              >
                {option.text}
              </Button>
            );
          })}
        </CardContent>
      </Card>

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
          <Button onClick={() => setConfirmOpen(true)} disabled={isSubmitting} size="sm">
            {isSubmitting ? "Gönderiliyor…" : "Sınavı Bitir"}
          </Button>
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

        {/* Dialog her soruda mount edilmiş olmalı — logout guard herhangi bir sorudan tetiklenebilir */}
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
              <AlertDialogCancel
                onClick={() => {
                  // İptal: bekleyen logout varsa temizle.
                  pendingLogoutRef.current = null;
                }}
              >
                Geri Dön
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleSubmit(false);
                  // pendingLogoutRef temizlenmez — onSuccess içinde çalıştırılacak.
                }}
              >
                Evet, Gönder
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

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
