import {
  ThemeFormCard,
  ThemeH1,
  ThemeH2,
  ThemeH3,
  ThemeKicker,
  ThemeLead,
  ThemeMuted,
  ThemeText,
} from "@/components/theme";
import { routes } from "@/lib/routes";
import { UiKitPageShell } from "@/components/ui-kit/ui-kit-page-shell";

export default function UiKitTypographyPage() {
  return (
    <UiKitPageShell
      title="Typography Component"
      description="Tema ile uyumlu baslik ve metin stillerinin tipografi preview'u."
      activeRoute={routes.uiKitTypography}
    >
      <ThemeFormCard className="space-y-3">
        <ThemeKicker>Typography Set</ThemeKicker>
        <ThemeH1 className="text-3xl sm:text-4xl">Heading One</ThemeH1>
        <ThemeH2>Heading Two</ThemeH2>
        <ThemeH3>Heading Three</ThemeH3>
        <ThemeLead>Bu satir lead metin ornegidir ve section aciklamasi icin kullanilir.</ThemeLead>
        <ThemeText>
          Normal paragraf metni, dashboard icerisindeki aciklama ve bilgi bloklarinda kullanilmak
          uzere optimize edildi.
        </ThemeText>
        <ThemeMuted>
          Muted metin ornegi: sistem notlari, tarih satirlari ve secondary bilgiler.
        </ThemeMuted>
      </ThemeFormCard>
    </UiKitPageShell>
  );
}
