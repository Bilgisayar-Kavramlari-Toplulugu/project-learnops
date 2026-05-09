import { ShieldCheck } from "lucide-react";
import OAuthButtonContainer from "@/components/oauth-button-container";
import MergeAccountForm from "@/components/merge-account-form";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { routes } from "@/lib/routes";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_state: "Oturum doğrulaması başarısız. Lütfen tekrar deneyin.",
  invalid_code: "Geçersiz yetkilendirme kodu. Lütfen tekrar deneyin.",
  oauth_failed: "Giriş başarısız. Lütfen tekrar deneyin.",
  server_error: "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
};

const PROVIDER_NAMES: Record<string, string> = {
  google: "Google",
  linkedin: "LinkedIn",
  github: "GitHub",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    provider?: string;
    merge_token?: string;
  }>;
}) {
  const { error, provider, merge_token } = await searchParams;

  const isAccountConflict = error === "account_conflict" && !!merge_token;

  let errorMessage =
    !isAccountConflict && error
      ? (ERROR_MESSAGES[error] ?? "Bir hata oluştu. Lütfen tekrar deneyin.")
      : null;

  if (errorMessage && error === "oauth_failed" && provider && PROVIDER_NAMES[provider]) {
    errorMessage = `${PROVIDER_NAMES[provider]} ile giriş başarısız. Lütfen tekrar deneyin.`;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5">
        {/* Header — landing ile aynı container */}
        <header className="flex items-center justify-between py-4 border-b border-border/60">
          <Logo
            href={routes.root}
            width={180}
            height={100}
            priority
            className="h-10 w-auto md:h-12"
          />
          <ThemeToggle />
        </header>

        {/* Main */}
        <main className="flex flex-1 items-center justify-center py-12">
          <div className="grid w-full max-w-3xl grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card">
            {/* Sol — branding */}
            <div className="flex flex-col justify-between gap-8 bg-slate-900 p-10 dark:bg-slate-950">
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-sky-400">
                  DevOps Yolculuğu
                </p>
                <h2 className="mb-3 text-xl font-medium leading-snug text-white">
                  Öğrenmeyi bir alışkanlığa dönüştür.
                </h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  DevOps kavramlarını kendi hızında, kalıcı olarak öğren.
                </p>
              </div>

              <ul className="flex flex-col gap-3">
                {[
                  {
                    icon: "🗺️",
                    title: "Net öğrenme yolu",
                    desc: "Karmaşık konuları adım adım öğren.",
                  },
                  { icon: "📈", title: "İlerleme takibi", desc: "Nerede kaldığını takip et" },
                  {
                    icon: "👥",
                    title: "Etkileşimli quizler",
                    desc: "Bilgini test ederek eksiklerini keşfet.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-white">{item.title}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sağ — form */}
            <div className="flex flex-col justify-center gap-6 p-10">
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <ShieldCheck className="size-3" />
                  Güvenli giriş
                </p>
                <h1 className="text-xl font-medium text-foreground">
                  {isAccountConflict ? "Hesap birleştirme" : "Giriş yap"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isAccountConflict
                    ? "Bu email adresiyle zaten bir hesabınız mevcut."
                    : "Aşağıdaki seçeneklerden biriyle devam et."}
                </p>
              </div>

              {errorMessage && (
                <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {errorMessage}
                </p>
              )}

              {isAccountConflict ? (
                <MergeAccountForm mergeToken={merge_token} />
              ) : (
                <>
                  <OAuthButtonContainer />
                  <p className="text-center text-[11px] text-muted-foreground">
                    Giriş yaparak{" "}
                    <span className="cursor-pointer underline">kullanım koşullarını</span> kabul
                    etmiş olursun.
                  </p>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
