import { ThemeExamCard } from "@/modules/ui-kit/components/theme";
import { routes } from "@/shared/lib/config/routes";
import { UiKitPageShell } from "@/modules/ui-kit/components/ui-kit-page-shell";

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
