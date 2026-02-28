"use client";

import { useState } from "react";

export default function OAuthButton({ provider }: { provider: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const providerSlug = provider.toLowerCase();

  const handleClick = () => {
    setIsLoading(true);
    window.location.href = `/api/auth/${providerSlug}/login`;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="flex w-full items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-800/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? "Yonlendiriliyor..." : `${provider} ile Giriş Yap`}
    </button>
  );
}
