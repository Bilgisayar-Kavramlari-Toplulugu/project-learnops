import { ThemeDocsCard } from "@/modules/ui-kit/components/theme";
import { routes } from "@/shared/lib/config/routes";
import { UiKitPageShell } from "@/modules/ui-kit/components/ui-kit-page-shell";

export default function UiKitDocsPage() {
  return (
    <UiKitPageShell
      title="Docs Component"
      description="Dokuman kart komponenti ortadaki preview alaninda render edilir."
      activeRoute={routes.uiKitDocs}
    >
      <ThemeDocsCard
        title="Cloud Native Handbook"
        summary="Onboarding, CI/CD ve deployment adimlari icin temel dokuman seti."
        href={routes.uiKitDocs}
        updatedLabel="Updated 2 hours ago"
        tags={["kubernetes", "ci-cd", "devops"]}
      />
    </UiKitPageShell>
  );
}
