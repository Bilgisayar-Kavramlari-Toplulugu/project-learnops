import { ThemeDocsCard } from "@/components/theme";
import { routes } from "@/lib/routes";
import { UiKitPageShell } from "@/components/ui-kit/ui-kit-page-shell";

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
