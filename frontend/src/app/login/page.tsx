import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OAuthButtonContainer from "@/components/oauth-button-container";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_state: "Oturum doğrulaması başarısız. Lütfen tekrar deneyin.",
  invalid_code: "Geçersiz yetkilendirme kodu. Lütfen tekrar deneyin.",
  oauth_failed: "Google ile giriş başarısız. Lütfen tekrar deneyin.",
  server_error: "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? "Bir hata oluştu. Lütfen tekrar deneyin.")
    : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
      <Card className="w-full rounded-2xl border-blue-100/85 bg-white/90 shadow-lg shadow-blue-100/45 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
        <CardHeader className="space-y-2">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-blue-700 uppercase dark:text-sky-300">
            <ShieldCheck className="size-3.5" />
            LearnOps Devops Yolculuğu
          </p>
          <CardTitle className="text-2xl text-center tracking-tight text-slate-900 dark:text-slate-100">
            Giris Yap
          </CardTitle>
          <CardDescription className="text-center">
            Aşağıdaki seçenekler ile giriş yapabilirsin.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMessage && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {errorMessage}
            </p>
          )}
          <OAuthButtonContainer />
        </CardContent>
      </Card>
    </main>
  );
}
