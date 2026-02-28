import Link from "next/link";
import { ArrowRight, Layers3, Sparkles } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { routes } from "@/shared/lib/config/routes";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-14 lg:px-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-700 uppercase shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-sky-300">
            <Sparkles className="size-3.5" />
            LearnOps Platform
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
            Öğrenme deneyimini modüler bir dashboard ile yönet.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Frontend iskeleti hazır. Dashboard, auth ve landing route&apos;ları ayrıştırılmış
            durumda ve `/api/*` rewrite katmanı korunuyor.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="h-10 rounded-xl px-5 text-sm font-medium">
              <Link href={routes.dashboard}>
                Dashboard&apos;a Git
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-xl border-blue-200 bg-white/80 px-5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
            >
              <Link href={routes.login}>Auth Ekranı</Link>
            </Button>
          </div>
        </section>
        <Card className="border-blue-100/90 bg-white/80 shadow-lg shadow-blue-100/40 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-100">
              <Layers3 className="size-4 text-blue-600 dark:text-sky-400" />
              Frontend Foundation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>Route yapısı: `dashboard`, `landing`, `login` olarak ayrıldı.</p>
            <p>UI katmanı: layout ve dashboard componentleri modüler kuruldu.</p>
            <p>Proxy dosyası: silinmeden, güvenli başlangıç kurgusu eklendi.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
