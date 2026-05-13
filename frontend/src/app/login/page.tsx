import { ShieldCheck } from "lucide-react";
import OAuthButtonContainer from "@/components/oauth-button-container";
import MergeAccountForm from "@/components/merge-account-form";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { routes } from "@/lib/routes";
import Link from "next/link";

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
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border/60 py-4">
          <Logo
            href={routes.root}
            width={180}
            height={100}
            priority
            className="h-9 w-auto sm:h-10 md:h-12"
          />

          <ThemeToggle />
        </header>

        {/* Main */}
        <main className="flex flex-1 items-center justify-center py-8 sm:py-10 md:py-14">
          <section className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm md:grid-cols-[0.95fr_1.05fr]">
            {/* Left */}
            <div
              className="
                relative overflow-hidden p-6 sm:p-8 md:p-10
                bg-gradient-to-br
                from-sky-100
                via-indigo-100
                to-slate-200
                dark:from-slate-900
                dark:via-indigo-950/80
                dark:to-slate-950
              "
            >
              {/* Glow */}
              <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/20" />

              <div className="pointer-events-none absolute -bottom-28 right-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl dark:bg-violet-500/20" />

              <div className="relative flex h-full flex-col justify-between gap-8">
                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-700 dark:text-sky-300">
                    DevOps Yolculuğu
                  </p>

                  <h2 className="max-w-sm text-2xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-3xl md:text-2xl">
                    Öğrenmeyi daha düzenli, takip edilebilir ve sürdürülebilir
                    hale getir.
                  </h2>

                  <p className="mt-4 max-w-sm text-sm leading-6 text-slate-700 dark:text-slate-300">
                    DevOps kavramlarını kendi hızında öğren, kaldığın yeri takip
                    et ve quizlerle ilerlemeni ölç.
                  </p>
                </div>

                <ul className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
                  {[
                    {
                      icon: "🗺️",
                      title: "Net öğrenme yolu",
                      desc: "Konuları adım adım takip et.",
                    },
                    {
                      icon: "📈",
                      title: "İlerleme takibi",
                      desc: "Nerede kaldığını kolayca gör.",
                    },
                    {
                      icon: "👥",
                      title: "Etkileşimli quizler",
                      desc: "Eksiklerini test ederek fark et.",
                    },
                  ].map((item) => (
                    <li
                      key={item.title}
                      className="
                        flex items-start gap-3 rounded-2xl
                        border border-slate-900/10
                        bg-white/45
                        p-3
                        shadow-sm
                        backdrop-blur
                        dark:border-white/10
                        dark:bg-white/[0.04]
                      "
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900/10 text-sm dark:bg-white/10">
                        {item.icon}
                      </span>

                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </p>

                        <p className="mt-1 text-[11px] leading-relaxed text-slate-700 dark:text-slate-400">
                          {item.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
              <div className="mx-auto w-full max-w-sm">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <ShieldCheck className="size-3.5" />
                  Güvenli giriş
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {isAccountConflict
                    ? "Hesap birleştirme"
                    : "Giriş yap"}
                </h1>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {isAccountConflict
                    ? "Bu email adresiyle zaten bir hesabınız mevcut."
                    : "Devam etmek için aşağıdaki giriş seçeneklerinden birini kullan."}
                </p>

<<<<<<< feat/kvkk
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
                      <Link
                        href="/legal#terms"
                        className="underline underline-offset-4 transition hover:text-slate-900 dark:hover:text-slate-100"
                      >
                        Kullanım Koşulları
                      </Link>{" "}
                      ve{" "}
                      <Link
                        href="/legal#privacy"
                        className="underline underline-offset-4 transition hover:text-slate-900 dark:hover:text-slate-100"
                      >
                        Gizlilik / KVKK Metni
                      </Link>
                      ’ni kabul etmiş olursun.
=======
                {errorMessage && (
                  <p className="mt-5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-5 text-destructive">
                    {errorMessage}
>>>>>>> release
                  </p>
                )}

                <div className="mt-6">
                  {isAccountConflict ? (
                    <MergeAccountForm mergeToken={merge_token} />
                  ) : (
                    <>
                      <OAuthButtonContainer />

                      <p className="mt-5 text-center text-[11px] leading-5 text-muted-foreground">
                        Giriş yaparak{" "}
                        <span className="cursor-pointer underline underline-offset-4">
                          kullanım koşullarını
                        </span>{" "}
                        kabul etmiş olursun.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}