"use client";

import { LockKeyhole } from "lucide-react";
import { useState } from "react";

import { AuthShell } from "@/modules/auth/components/auth-shell";
import { ProviderAuthButtons } from "@/modules/auth/components/provider-auth-buttons";
import type { AuthProvider } from "@/modules/auth/types/auth.types";
import { env } from "@/shared/lib/config/env";

function buildProviderAuthUrl(provider: AuthProvider) {
  const base = env.nextPublicApiBaseUrl.replace(/\/$/, "");
  return `${base}/auth/providers/${provider}`;
}

export default function LoginPage() {
  const [pendingProvider, setPendingProvider] = useState<AuthProvider | null>(null);

  function handleProviderClick(provider: AuthProvider) {
    setPendingProvider(provider);
    window.location.assign(buildProviderAuthUrl(provider));
  }

  return (
    <AuthShell
      icon={<LockKeyhole className="size-5" />}
      title="LearnOps Giris"
      description="Devam etmek icin bir saglayici sec."
    >
      <ProviderAuthButtons onClick={handleProviderClick} pendingProvider={pendingProvider} />
    </AuthShell>
  );
}
