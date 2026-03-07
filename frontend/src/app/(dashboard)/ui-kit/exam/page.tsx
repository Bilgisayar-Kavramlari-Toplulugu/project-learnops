import { ThemeExamCard } from "@/components/theme";
import { routes } from "@/lib/routes";
import { UiKitPageShell } from "@/components/ui-kit/ui-kit-page-shell";

export default function UiKitExamPage() {
  return (
    <UiKitPageShell
      title="Exam Component"
      description="Sinav karti bu tasarim diline uygun olarak ortada preview edilir."
      activeRoute={routes.uiKitExam}
    >
      <ThemeExamCard
        title="Kubernetes Fundamentals"
        nextAttempt="Today"
        readiness={82}
        level="Beginner"
      />
    </UiKitPageShell>
  );
}
