import {
  ThemeCheckboxField,
  ThemeField,
  ThemeFormActions,
  ThemeFormCard,
  ThemeInput,
  ThemeKicker,
  ThemeMuted,
  ThemeTextarea,
} from "@/components/theme";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { UiKitPageShell } from "@/components/ui-kit/ui-kit-page-shell";

export default function UiKitFormPage() {
  return (
    <UiKitPageShell
      title="Form Component"
      description="Form alanlari, hint/error ve action yapisi tek bir yerde sunulur."
      activeRoute={routes.uiKitForm}
    >
      <ThemeFormCard>
        <ThemeKicker>Form Components</ThemeKicker>
        <ThemeMuted className="mt-1">
          Input, textarea, checkbox ve action satiri bu blokta.
        </ThemeMuted>

        <form className="mt-4 space-y-3">
          <ThemeField
            label="Resource Name"
            htmlFor="resource-name"
            hint="Ornek: LearnOps API Gateway"
            required
          >
            <ThemeInput id="resource-name" placeholder="LearnOps API Gateway" defaultValue="" />
          </ThemeField>

          <ThemeField
            label="Description"
            htmlFor="resource-description"
            hint="Bu alan release notlarinda gozukur."
          >
            <ThemeTextarea id="resource-description" placeholder="Resource aciklamasi..." />
          </ThemeField>

          <ThemeCheckboxField defaultChecked label="Show in dashboard widgets" />

          <ThemeFormActions>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-blue-200 bg-white/80 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              Cancel
            </Button>
            <Button type="button" className="rounded-xl bg-blue-600 hover:bg-blue-700">
              Save Draft
            </Button>
          </ThemeFormActions>
        </form>
      </ThemeFormCard>
    </UiKitPageShell>
  );
}
