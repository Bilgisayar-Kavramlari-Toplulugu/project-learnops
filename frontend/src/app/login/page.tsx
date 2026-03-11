"use client";

import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OAuthButtonContainer from "@/components/oauth-button-container";

export default function LoginPage() {
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
          <OAuthButtonContainer />
        </CardContent>
      </Card>
    </main>
  );
}
