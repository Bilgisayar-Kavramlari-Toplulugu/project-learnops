import {
  ThemeField,
  ThemeFormCard,
  ThemeInput,
  ThemeModal,
  ThemeModalContent,
  ThemeModalDescription,
  ThemeModalFooter,
  ThemeModalHeader,
  ThemeModalTitle,
  ThemeModalTrigger,
  ThemeTextarea,
} from "@/components/theme";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { UiKitPageShell } from "@/components/ui-kit/ui-kit-page-shell";

export default function UiKitModalPage() {
  return (
    <UiKitPageShell
      title="Modal Component"
      description="Modal trigger'a tiklayinca dialog ortada acilir ve form icerigi gorunur."
      activeRoute={routes.uiKitModal}
    >
      <ThemeFormCard className="space-y-4">
        <ThemeModal>
          <ThemeModalTrigger asChild>
            <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700">
              Open Center Modal
            </Button>
          </ThemeModalTrigger>
          <ThemeModalContent>
            <ThemeModalHeader>
              <ThemeModalTitle>Create New Workspace</ThemeModalTitle>
              <ThemeModalDescription>
                Bu modal form akisini gostermek icin hazirlanmistir.
              </ThemeModalDescription>
            </ThemeModalHeader>

            <div className="mt-4 space-y-3">
              <ThemeField label="Workspace Name" htmlFor="workspace-name" required>
                <ThemeInput id="workspace-name" placeholder="LearnOps Staging" />
              </ThemeField>
              <ThemeField label="Notes" htmlFor="workspace-notes">
                <ThemeTextarea id="workspace-notes" placeholder="Opsiyonel not..." />
              </ThemeField>
            </div>

            <ThemeModalFooter>
              <Button
                variant="outline"
                className="rounded-xl border-blue-200 bg-white/80 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Cancel
              </Button>
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-700">Create</Button>
            </ThemeModalFooter>
          </ThemeModalContent>
        </ThemeModal>
      </ThemeFormCard>
    </UiKitPageShell>
  );
}
