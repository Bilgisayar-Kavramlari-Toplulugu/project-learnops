"use client";

import { startOAuth, type OAuthProvider } from "@/lib/auth";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  linkedin: "LinkedIn",
};

const ALL_PROVIDERS: OAuthProvider[] = ["google", "github", "linkedin"];

/** JWT payload'ının base64 kısmını decode eder (imza doğrulaması yapılmaz — sadece görüntü amaçlı). */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

interface MergeAccountFormProps {
  mergeToken: string;
  email: string;
}

export default function MergeAccountForm({ mergeToken, email }: MergeAccountFormProps) {
  const payload = decodeJwtPayload(mergeToken);
  const newProvider = typeof payload.new_provider === "string" ? payload.new_provider : null;

  // Mevcut hesapta kullanılabilecek provider'lar = yeni denenenden farklı olanlar
  const existingProviders = ALL_PROVIDERS.filter((p) => p !== newProvider);

  function handleMerge(provider: OAuthProvider) {
    // Merge token'ı login sonrası kullanmak üzere sakla
    sessionStorage.setItem("pending_merge_token", mergeToken);
    startOAuth(provider);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Hesap çakışması</p>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
          <span className="font-medium">{email}</span> adresi zaten başka bir yöntemle kayıtlı.{" "}
          {newProvider && (
            <>
              <span className="font-medium">{PROVIDER_LABELS[newProvider] ?? newProvider}</span>{" "}
              hesabını bağlamak için önce mevcut hesabınla giriş yap.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">Mevcut hesabınla giriş yap:</p>
        {existingProviders.map((provider) => (
          <button
            key={provider}
            onClick={() => handleMerge(provider)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {PROVIDER_LABELS[provider]} ile giriş yap ve hesapları birleştir
          </button>
        ))}
      </div>

      <a
        href="/login"
        className="text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
      >
        İptal — normal giriş ekranına dön
      </a>
    </div>
  );
}
