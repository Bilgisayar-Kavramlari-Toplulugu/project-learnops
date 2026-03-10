"use client";

import { useState } from "react";
import { Briefcase, Code, Globe, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProviderId = "google" | "linkedin" | "github";

const providers: {
  id: ProviderId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "google", label: "Google", icon: Globe },
  { id: "linkedin", label: "LinkedIn", icon: Briefcase },
  { id: "github", label: "GitHub", icon: Code },
];

export default function LoginPage() {
  const [selectedProvider, setSelectedProvider] = useState<ProviderId | null>(null);

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
          {providers.map((provider) => {
            const Icon = provider.icon;
            const isSelected = selectedProvider === provider.id;

            return (
              <Button
                key={provider.id}
                type="button"
                variant="outline"
                className={cn(
                  "w-full rounded-xl",
                  isSelected &&
                    "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-sky-500/70 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20",
                )}
                aria-pressed={isSelected}
                onClick={() => setSelectedProvider(provider.id)}
              >
                <Icon className="size-4" />
                {provider.label} ile Devam Et
              </Button>
            );
          })}

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            {selectedProvider
              ? `${providers.find((provider) => provider.id === selectedProvider)?.label} secildi. Auth akisi henuz bagli degil.`
              : "Devam etmek icin bir sosyal hesap sec."}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
