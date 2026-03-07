import {
  ThemeField,
  ThemeFormCard,
  ThemeInput,
  ThemeKicker,
  ThemeMuted,
  ThemeTextarea,
} from "@/components/theme";
import { routes } from "@/lib/routes";
import { UiKitPageShell } from "@/components/ui-kit/ui-kit-page-shell";

export default function UiKitInputPage() {
  return (
    <UiKitPageShell
      title="Input Component"
      description="Input ve textarea stilleri, normal ve invalid durumlariyla ortada gosterilir."
      activeRoute={routes.uiKitInput}
    >
      <ThemeFormCard className="space-y-3">
        <ThemeKicker>Input States</ThemeKicker>
        <ThemeMuted>Focus, hint ve error kullanimi icin hazir input varyantlari.</ThemeMuted>

        <ThemeField
          label="Normal Input"
          htmlFor="normal-input"
          hint="Bu bir normal input ornegidir."
        >
          <ThemeInput id="normal-input" placeholder="Resource name..." />
        </ThemeField>

        <ThemeField label="Invalid Input" htmlFor="invalid-input" error="Bu alan zorunlu.">
          <ThemeInput id="invalid-input" placeholder="Type something..." invalid />
        </ThemeField>

        <ThemeField label="Textarea" htmlFor="input-textarea" hint="Uzun metin alanlari icin.">
          <ThemeTextarea id="input-textarea" placeholder="Long form note..." />
        </ThemeField>
      </ThemeFormCard>
    </UiKitPageShell>
  );
}
