import { notFound } from "next/navigation";
import { QuizResultScreen } from "@/components/quiz/quiz-result-screen";

interface ResultsPageProps {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}

// API'den gelen yanıt yapısı
interface AnswerResultItem {
  question_id: string;
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

// Frontend'in ihtiyaç duyduğu genişletilmiş yapı
interface AnswerResult extends AnswerResultItem {
  question_text: string;
  options: string[];
}

interface QuizResultData {
  score: number;
  totalQuestions: number;
  passed: boolean;
  timeSpentSecs: number;
  answers: AnswerResult[];
}

async function getQuizResults(attemptId: string): Promise<QuizResultData | null> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${API_URL}/api/quiz-attempts/${attemptId}/results`, {
      cache: "no-store",
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Failed to fetch quiz results:", response.status);
      return null;
    }

    const data: QuizSubmitResponse = await response.json();

    // Backend'den gelen veriyi frontend formatına dönüştür
    // NOT: question_text ve options backend'den gelmiyor,
    // bu veriler quiz başlangıcında alınan questions listesinden gelmeli
    const answers: AnswerResult[] = data.answers.map((answer) => ({
      ...answer,
      question_text: `Soru ${answer.question_id.slice(0, 8)}`,
      options: ["Seçenek A", "Seçenek B", "Seçenek C", "Seçenek D"],
    }));

    return {
      score: data.score,
      totalQuestions: data.total_questions,
      passed: data.passed,
      timeSpentSecs: data.time_spent_secs,
      answers,
    };
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return null;
  }
}

export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const { quizId } = await params;
  const { attemptId } = await searchParams;

  if (!attemptId) {
    notFound();
  }

  const resultData = await getQuizResults(attemptId);

  if (!resultData) {
    notFound();
  }

  // Callback'leri router üzerinden geç
  const handleRetry = () => {
    // Quiz sayfasına geri dön
    window.location.href = `/quiz/${quizId}`;
  };

  const handleBackToCourse = () => {
    // Kurs sayfasına geri dön
    window.location.href = `/courses/${quizId}`;
  };

  const handleViewHistory = () => {
    // Geçmiş denemeler sayfasına git
    window.location.href = `/quiz/${quizId}/history`;
  };

  return (
    <QuizResultScreen
      score={resultData.score}
      totalQuestions={resultData.totalQuestions}
      passed={resultData.passed}
      timeSpentSecs={resultData.timeSpentSecs}
      answers={resultData.answers}
      onRetry={handleRetry}
      onBackToCourse={handleBackToCourse}
      onViewHistory={handleViewHistory}
    />
  );
}