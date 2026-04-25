"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

import { useCourseDetail } from "@/hooks/courses/use-course-detail";
import { useQuiz } from "@/hooks/courses/use-quiz";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { QuizAnswer, QuizResult, QuizSubmitPayload } from "@/types";

interface QuizClientProps {
  slug: string;
}

// ─── Timer Yardımcısı ─────────────────────────────────────────────────────────

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

// ─── Sonuç Ekranı ─────────────────────────────────────────────────────────────

function QuizResultScreen({ result, onBack }: { result: QuizResult; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <CheckCircle className={result.passed ? "text-emerald-500" : "text-red-500"} size={64} />
      <h2 className="text-2xl font-bold">{result.passed ? "Tebrikler!" : "Bir Dahaki Sefere!"}</h2>
      <p className="text-muted-foreground text-lg">
        {result.score} / {result.total} doğru cevap
      </p>
      <p className="text-muted-foreground">
        {result.passed
          ? "Sınavı başarıyla tamamladın."
          : "Sınav puanın geçme sınırının altında kaldı."}
      </p>
      <Button onClick={onBack} variant="outline">
        Kursa Dön
      </Button>
    </div>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────

export default function QuizClient({ slug }: QuizClientProps) {
  const router = useRouter();

  // FE-22 bağımlılığı: useCourseDetail slug'dan courseId'yi verir.
  // Aynı slug için cache devredeyse network isteği yapılmaz — beklenen davranış.
  const { data: course, isLoading: courseLoading, isError: courseError } = useCourseDetail(slug);
  const courseId = course?.id;

  const { data: session, isLoading: sessionLoading, isError: sessionError } = useQuiz(courseId);

  // ─── Local State ──────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId → optionId
  const [remaining, setRemaining] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hasSubmittedRef = useRef(false); // Çift submit önleyici

  // ─── Submit Mutation ──────────────────────────────────────────────────────
  const { mutate: submitQuiz, isPending: isSubmitting } = useMutation({
    mutationFn: async (payload: QuizSubmitPayload) => {
      const { data } = await api.post<QuizResult>(`/courses/${courseId}/quiz/submit`, payload);
      return data;
    },
    onSuccess: (data) => {
      hasSubmittedRef.current = true; // Başarılı gönderimde kilitle
      setQuizResult(data);
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
      hasSubmittedRef.current = true; // Mutation süresince çift submit önlenir

      if (isAutoSubmit) {
        toast.info("Süre doldu", {
          description: "Sınavın otomatik olarak gönderildi.",
        });
      }

      const answerPayload: QuizAnswer[] = session.questions
        .filter((q) => answers[q.id] !== undefined)
        .map((q) => ({
          question_id: q.id,
          selected_option_id: answers[q.id],
        }));

      submitQuiz({ session_id: session.session_id, answers: answerPayload });
    },
    [session, answers, submitQuiz],
  );

  // ─── Timer ────────────────────────────────────────────────────────────────
  // handleSubmit'in güncel referansını ref'te tut; timer effect'i sadece
  // session'a bağlı kalır — her cevap seçiminde interval yeniden başlamaz.
  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    if (!session) return;

    // setState yalnızca callback içinde çağrılır — effect body'de doğrudan çağrılmaz
    // submitted: interval temizlendikten sonra tekrar submit tetiklenmesini önler
    let submitted = false;

    const tick = () => {
      const r = calcRemaining(session.started_at, session.duration_seconds);
      setRemaining(r);
      if (r <= 0 && !submitted) {
        submitted = true;
        handleSubmitRef.current(true); // otomatik submit
      }
    };

    // setTimeout(0): ilk değeri bir sonraki event loop tick'te hesapla
    const initTimer = setTimeout(tick, 0);
    const intervalId = setInterval(tick, 1000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(intervalId);
    };
  }, [session]); // answers değişiminde interval yeniden başlamaz

  // ─── Loading / Error States ───────────────────────────────────────────────
  if (courseLoading || sessionLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground animate-pulse">Sınav yükleniyor…</p>
      </div>
    );
  }

  if (courseError) {
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

  // ─── Sonuç Ekranı ─────────────────────────────────────────────────────────
  if (quizResult) {
    return (
      <QuizResultScreen result={quizResult} onBack={() => router.push(routes.courseDetail(slug))} />
    );
  }

  const questions = session.questions;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLast = currentIndex === totalQuestions - 1;
  const isTimeCritical = remaining !== null && remaining < 60;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      {/* Üst Bar: İlerleme + Timer */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">
          Soru {currentIndex + 1} / {totalQuestions}
        </span>

        {/* Geri Sayım */}
        <div
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
      <div className="bg-secondary h-1.5 w-full rounded-full">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(Object.keys(answers).length / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Soru Kartı */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium leading-relaxed">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.id]: option.id,
                  }))
                }
                className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:bg-accent hover:text-accent-foreground"
                }`}
                disabled={isSubmitting}
              >
                {option.text}
              </button>
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
                    {Object.keys(answers).length < session.questions.length && (
                      <span className="font-medium text-orange-500">
                        {session.questions.length - Object.keys(answers).length} soru cevaplanmadı.
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
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            disabled={isSubmitting}
            aria-label={`Soru ${i + 1}'e git${answers[q.id] ? " (cevaplandı)" : ""}`}
            className={`h-8 w-8 rounded-full text-xs font-semibold transition-colors ${
              i === currentIndex
                ? "bg-primary text-primary-foreground"
                : answers[q.id]
                  ? "bg-emerald-500 text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
